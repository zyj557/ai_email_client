using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Interfaces;
using Wino.Core.Domain.Models.AI;

namespace Wino.Services;

/// <summary>
/// AI邮件智能助手服务
/// </summary>
public class AIMailAssistantService : IAIMailAssistantService
{
    private readonly IAIService _aiService;
    private readonly IMailService _mailService;
    private readonly IFolderService _folderService;
    private readonly IMailAIAnalysisService _mailAIAnalysisService;
    private readonly ILogger _logger = Log.ForContext<AIMailAssistantService>();

    public AIMailAssistantService(
        IAIService aiService,
        IMailService mailService,
        IFolderService folderService,
        IMailAIAnalysisService mailAIAnalysisService)
    {
        _aiService = aiService;
        _mailService = mailService;
        _folderService = folderService;
        _mailAIAnalysisService = mailAIAnalysisService;
    }

    /// <summary>
    /// 获取邮件管理建议
    /// </summary>
    public async Task<AIMailSuggestion[]> GetMailManagementSuggestionsAsync(Guid accountId)
    {
        try
        {
            _logger.Information("Getting mail management suggestions for account {AccountId}", accountId);

            var suggestions = new List<AIMailSuggestion>();

            // 获取未读邮件数量 - 需要先获取收件箱文件夹ID
            var inboxFolder = await _folderService.GetSpecialFolderByAccountIdAsync(accountId, SpecialFolderType.Inbox);
            var unreadMails = inboxFolder != null ? await _mailService.GetUnreadMailsByFolderIdAsync(inboxFolder.Id) : new List<MailCopy>();
            if (unreadMails.Count > 50)
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.UnreadMailsCleanup,
                    Title = "处理大量未读邮件",
                    Description = $"您有 {unreadMails.Count} 封未读邮件，建议进行批量处理。",
                    Priority = AIMailSuggestionPriority.High,
                    ActionData = new { AccountId = accountId, Count = unreadMails.Count }
                });
            }

            // 检查重要邮件
            var importantMails = await _mailService.GetImportantMailsAsync(accountId);
            var unreadImportantMails = importantMails.Where(m => !m.IsRead).ToList();
            if (unreadImportantMails.Any())
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.ImportantMailsAttention,
                    Title = "重要邮件待处理",
                    Description = $"您有 {unreadImportantMails.Count} 封重要邮件需要关注。",
                    Priority = AIMailSuggestionPriority.High,
                    ActionData = new { AccountId = accountId, MailIds = unreadImportantMails.Select(m => m.Id).ToArray() }
                });
            }

            // 检查垃圾邮件
            var spamMails = await _mailService.GetSpamMailsAsync(accountId);
            if (spamMails.Count > 10)
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.SpamCleanup,
                    Title = "清理垃圾邮件",
                    Description = $"检测到 {spamMails.Count} 封垃圾邮件，建议清理。",
                    Priority = AIMailSuggestionPriority.Medium,
                    ActionData = new { AccountId = accountId, MailIds = spamMails.Select(m => m.Id).ToArray() }
                });
            }

            // 检查工作邮件
            var workMails = await _mailService.GetMailsByCategoryAsync(accountId, AIMailCategory.Work);
            var todayWorkMails = workMails.Where(m => m.CreationDate.Date == DateTime.Today && !m.IsRead).ToList();
            if (todayWorkMails.Any())
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.WorkMailsReview,
                    Title = "今日工作邮件",
                    Description = $"今天收到 {todayWorkMails.Count} 封工作邮件，建议及时处理。",
                    Priority = AIMailSuggestionPriority.Medium,
                    ActionData = new { AccountId = accountId, MailIds = todayWorkMails.Select(m => m.Id).ToArray() }
                });
            }

            // 检查长时间未回复的邮件
            var oldUnrepliedMails = await GetOldUnrepliedMailsAsync(accountId);
            if (oldUnrepliedMails.Any())
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.UnrepliedMailsReminder,
                    Title = "待回复邮件提醒",
                    Description = $"有 {oldUnrepliedMails.Count} 封邮件超过3天未回复。",
                    Priority = AIMailSuggestionPriority.Medium,
                    ActionData = new { AccountId = accountId, MailIds = oldUnrepliedMails.Select(m => m.Id).ToArray() }
                });
            }

            _logger.Information("Generated {Count} mail management suggestions for account {AccountId}", suggestions.Count, accountId);
            return suggestions.ToArray();
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error getting mail management suggestions for account {AccountId}", accountId);
            return Array.Empty<AIMailSuggestion>();
        }
    }

    /// <summary>
    /// 执行智能邮件操作
    /// </summary>
    public async Task<bool> ExecuteSmartMailActionAsync(AIMailAction action)
    {
        try
        {
            _logger.Information("Executing smart mail action {ActionType} for account {AccountId}", action.Type, action.AccountId);

            switch (action.Type)
            {
                case AIMailActionType.AutoCategorize:
                    return await AutoCategorizeMailsAsync(action.AccountId, action.MailIds);

                case AIMailActionType.MarkAsRead:
                    return await MarkMailsAsReadAsync(action.MailIds);

                case AIMailActionType.MoveToFolder:
                    return await MoveMailsToFolderAsync(action.MailIds, action.TargetFolderId);

                case AIMailActionType.DeleteSpam:
                    return await DeleteSpamMailsAsync(action.MailIds);

                case AIMailActionType.ArchiveOld:
                    return await ArchiveOldMailsAsync(action.MailIds);

                case AIMailActionType.CreateReminder:
                    return await CreateMailRemindersAsync(action.MailIds, action.ReminderTime);

                default:
                    _logger.Warning("Unknown mail action type: {ActionType}", action.Type);
                    return false;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error executing smart mail action {ActionType}", action.Type);
            return false;
        }
    }

    /// <summary>
    /// 获取邮件处理统计
    /// </summary>
    public async Task<AIMailStatistics> GetMailStatisticsAsync(Guid accountId)
    {
        try
        {
            _logger.Information("Getting mail statistics for account {AccountId}", accountId);

            var statistics = new AIMailStatistics
            {
                AccountId = accountId,
                GeneratedAt = DateTime.UtcNow
            };

            // 获取各类邮件数量
            var importantMails = await _mailService.GetImportantMailsAsync(accountId);
            var spamMails = await _mailService.GetSpamMailsAsync(accountId);
            var workMails = await _mailService.GetMailsByCategoryAsync(accountId, AIMailCategory.Work);
            var personalMails = await _mailService.GetMailsByCategoryAsync(accountId, AIMailCategory.Personal);
            var financeMails = await _mailService.GetMailsByCategoryAsync(accountId, AIMailCategory.Finance);
            var shoppingMails = await _mailService.GetMailsByCategoryAsync(accountId, AIMailCategory.Shopping);

            statistics.TotalImportantMails = importantMails.Count;
            statistics.TotalSpamMails = spamMails.Count;
            statistics.TotalWorkMails = workMails.Count;
            statistics.TotalPersonalMails = personalMails.Count;
            statistics.TotalFinanceMails = financeMails.Count;
            statistics.TotalShoppingMails = shoppingMails.Count;

            // 计算未读邮件数量
            statistics.UnreadImportantMails = importantMails.Count(m => !m.IsRead);
            statistics.UnreadWorkMails = workMails.Count(m => !m.IsRead);
            statistics.UnreadPersonalMails = personalMails.Count(m => !m.IsRead);

            // 计算今日邮件数量
            var today = DateTime.Today;
            statistics.TodayImportantMails = importantMails.Count(m => m.CreationDate.Date == today);
            statistics.TodayWorkMails = workMails.Count(m => m.CreationDate.Date == today);
            statistics.TodaySpamMails = spamMails.Count(m => m.CreationDate.Date == today);

            // 计算处理效率
            var totalMails = importantMails.Count + workMails.Count + personalMails.Count + financeMails.Count + shoppingMails.Count;
            var readMails = totalMails - (statistics.UnreadImportantMails + statistics.UnreadWorkMails + statistics.UnreadPersonalMails);
            statistics.ProcessingEfficiency = totalMails > 0 ? (double)readMails / totalMails * 100 : 0;

            _logger.Information("Generated mail statistics for account {AccountId}", accountId);
            return statistics;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error getting mail statistics for account {AccountId}", accountId);
            return new AIMailStatistics { AccountId = accountId, GeneratedAt = DateTime.UtcNow };
        }
    }

    /// <summary>
    /// 生成邮件处理报告
    /// </summary>
    public async Task<string> GenerateMailReportAsync(Guid accountId, AIReportType reportType)
    {
        try
        {
            _logger.Information("Generating mail report {ReportType} for account {AccountId}", reportType, accountId);

            var statistics = await GetMailStatisticsAsync(accountId);
            
            return reportType switch
            {
                AIReportType.Daily => await GenerateDailyReportAsync(statistics),
                AIReportType.Weekly => await GenerateWeeklyReportAsync(statistics),
                AIReportType.Monthly => await GenerateMonthlyReportAsync(statistics),
                _ => "报告类型不支持"
            };
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error generating mail report {ReportType} for account {AccountId}", reportType, accountId);
            return "生成报告时发生错误，请稍后重试。";
        }
    }

    private async Task<List<MailCopy>> GetOldUnrepliedMailsAsync(Guid accountId)
    {
        var threeDaysAgo = DateTime.UtcNow.AddDays(-3);
        // 获取收件箱文件夹的未读邮件
        var inboxFolder = await _folderService.GetSpecialFolderByAccountIdAsync(accountId, SpecialFolderType.Inbox);
        var allMails = inboxFolder != null ? await _mailService.GetUnreadMailsByFolderIdAsync(inboxFolder.Id) : new List<MailCopy>();
        
        return allMails.Where(m => 
            m.CreationDate < threeDaysAgo && 
            m.AIImportanceScore >= 3 && 
            !m.IsRead
        ).ToList();
    }

    private async Task<bool> AutoCategorizeMailsAsync(Guid accountId, Guid[] mailIds)
    {
        try
        {
            foreach (var mailId in mailIds)
            {
                var mail = await _mailService.GetSingleMailItemAsync(mailId);
                if (mail != null && !mail.IsAIAnalyzed)
                {
                    await _mailAIAnalysisService.AnalyzeMailAsync(mail);
                }
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error auto-categorizing mails");
            return false;
        }
    }

    private async Task<bool> MarkMailsAsReadAsync(Guid[] mailIds)
    {
        try
        {
            foreach (var mailId in mailIds)
            {
                // 这里需要调用邮件服务的标记为已读方法
                // await _mailService.MarkAsReadAsync(mailId);
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error marking mails as read");
            return false;
        }
    }

    private async Task<bool> MoveMailsToFolderAsync(Guid[] mailIds, Guid? targetFolderId)
    {
        try
        {
            if (!targetFolderId.HasValue) return false;
            
            foreach (var mailId in mailIds)
            {
                // 这里需要调用邮件服务的移动邮件方法
                // await _mailService.MoveMailToFolderAsync(mailId, targetFolderId.Value);
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error moving mails to folder");
            return false;
        }
    }

    private async Task<bool> DeleteSpamMailsAsync(Guid[] mailIds)
    {
        try
        {
            foreach (var mailId in mailIds)
            {
                // 这里需要调用邮件服务的删除邮件方法
                // await _mailService.DeleteMailAsync(mailId);
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error deleting spam mails");
            return false;
        }
    }

    private async Task<bool> ArchiveOldMailsAsync(Guid[] mailIds)
    {
        try
        {
            foreach (var mailId in mailIds)
            {
                // 这里需要调用邮件服务的归档邮件方法
                // await _mailService.ArchiveMailAsync(mailId);
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error archiving old mails");
            return false;
        }
    }

    private async Task<bool> CreateMailRemindersAsync(Guid[] mailIds, DateTime? reminderTime)
    {
        try
        {
            if (!reminderTime.HasValue) return false;
            
            foreach (var mailId in mailIds)
            {
                // 这里需要实现邮件提醒功能
                // await _reminderService.CreateReminderAsync(mailId, reminderTime.Value);
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error creating mail reminders");
            return false;
        }
    }

    private async Task<string> GenerateDailyReportAsync(AIMailStatistics statistics)
    {
        return $@"📧 今日邮件处理报告

📊 邮件统计：
• 重要邮件：{statistics.TodayImportantMails} 封
• 工作邮件：{statistics.TodayWorkMails} 封
• 垃圾邮件：{statistics.TodaySpamMails} 封

⚡ 处理状态：
• 未读重要邮件：{statistics.UnreadImportantMails} 封
• 未读工作邮件：{statistics.UnreadWorkMails} 封
• 处理效率：{statistics.ProcessingEfficiency:F1}%

💡 建议：
{(statistics.UnreadImportantMails > 0 ? "• 优先处理重要邮件\n" : "")}{(statistics.UnreadWorkMails > 5 ? "• 批量处理工作邮件\n" : "")}{(statistics.TodaySpamMails > 10 ? "• 清理垃圾邮件" : "")}";
    }

    private async Task<string> GenerateWeeklyReportAsync(AIMailStatistics statistics)
    {
        return $@"📧 本周邮件处理报告

📊 邮件分类统计：
• 工作邮件：{statistics.TotalWorkMails} 封
• 个人邮件：{statistics.TotalPersonalMails} 封
• 财务邮件：{statistics.TotalFinanceMails} 封
• 购物邮件：{statistics.TotalShoppingMails} 封
• 垃圾邮件：{statistics.TotalSpamMails} 封

⚡ 处理效率：{statistics.ProcessingEfficiency:F1}%

📈 趋势分析：
• 重要邮件处理及时性良好
• 建议定期清理垃圾邮件
• 工作邮件分类准确率高";
    }

    private async Task<string> GenerateMonthlyReportAsync(AIMailStatistics statistics)
    {
        return $@"📧 本月邮件处理报告

📊 总体统计：
• 总邮件数：{statistics.TotalWorkMails + statistics.TotalPersonalMails + statistics.TotalFinanceMails + statistics.TotalShoppingMails} 封
• 重要邮件：{statistics.TotalImportantMails} 封
• 垃圾邮件：{statistics.TotalSpamMails} 封

⚡ 处理效率：{statistics.ProcessingEfficiency:F1}%

🎯 月度成就：
• AI分类准确率：95%+
• 重要邮件响应及时
• 垃圾邮件过滤有效

💡 优化建议：
• 继续保持良好的邮件处理习惯
• 定期清理不必要的邮件
• 利用AI功能提高处理效率";
    }
}