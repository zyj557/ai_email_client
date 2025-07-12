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
/// AI邮件工作流服务
/// </summary>
public class AIMailWorkflowService : IAIMailWorkflowService
{
    private readonly IMailAIAnalysisService _mailAIAnalysisService;
    private readonly IAIMailTranslationService _aiMailTranslationService;
    private readonly IAIMailAssistantService _aiMailAssistantService;
    private readonly IAIMailSettingsService _aiMailSettingsService;
    private readonly IMailService _mailService;
    private readonly IFolderService _folderService;
    private readonly ILogger _logger = Log.ForContext<AIMailWorkflowService>();

    public AIMailWorkflowService(
        IMailAIAnalysisService mailAIAnalysisService,
        IAIMailTranslationService aiMailTranslationService,
        IAIMailAssistantService aiMailAssistantService,
        IAIMailSettingsService aiMailSettingsService,
        IMailService mailService,
        IFolderService folderService)
    {
        _mailAIAnalysisService = mailAIAnalysisService;
        _aiMailTranslationService = aiMailTranslationService;
        _aiMailAssistantService = aiMailAssistantService;
        _aiMailSettingsService = aiMailSettingsService;
        _mailService = mailService;
        _folderService = folderService;
    }

    /// <summary>
    /// 处理新邮件的完整AI工作流
    /// </summary>
    public async Task<AIMailWorkflowResult> ProcessNewMailWorkflowAsync(MailCopy mail)
    {
        try
        {
            _logger.Information("Starting AI workflow for new mail {MailId}", mail.Id);

            var result = new AIMailWorkflowResult
            {
                MailId = mail.UniqueId,
                StartTime = DateTime.UtcNow,
                Success = true
            };

            // 获取账户的AI设置
            var settings = await _aiMailSettingsService.GetAIMailSettingsAsync(mail.AssignedAccount.Id);
            
            var steps = new List<string>();

            // 步骤1: AI分析（分类、重要性评分、垃圾邮件检测）
            if (settings.AutoCategorizationEnabled || settings.ImportanceScoringEnabled || settings.SpamDetectionEnabled)
            {
                _logger.Information("Performing AI analysis for mail {MailId}", mail.Id);
                var analysisResult = await _mailAIAnalysisService.AnalyzeMailAsync(mail);
                if (analysisResult != null)
                {
                    steps.Add("AI分析完成");
                    result.AnalysisCompleted = true;
                    
                    // 更新使用统计
                    if (settings.AutoCategorizationEnabled)
                        await _aiMailSettingsService.UpdateAIFeatureUsageAsync(mail.AssignedAccount.Id, AIFeatureType.AutoCategorization);
                    if (settings.ImportanceScoringEnabled)
                        await _aiMailSettingsService.UpdateAIFeatureUsageAsync(mail.AssignedAccount.Id, AIFeatureType.ImportanceScoring);
                    if (settings.SpamDetectionEnabled)
                        await _aiMailSettingsService.UpdateAIFeatureUsageAsync(mail.AssignedAccount.Id, AIFeatureType.SpamDetection);
                }
                else
                {
                    steps.Add("AI分析失败");
                    result.Success = false;
                }
            }

            // 步骤2: 自动翻译（如果启用且检测到外语）
            if (settings.AutoTranslationEnabled && result.Success)
            {
                var detectedLanguage = _aiMailTranslationService.DetectMailLanguage(mail);
                if (detectedLanguage != settings.PreferredLanguage && detectedLanguage != AILanguage.Auto)
                {
                    _logger.Information("Performing auto translation for mail {MailId}", mail.Id);
                    var translatedContent = await _aiMailTranslationService.TranslateMailContentAsync(mail, settings.PreferredLanguage);
                    if (!string.IsNullOrEmpty(translatedContent))
                    {
                        steps.Add($"自动翻译完成 ({detectedLanguage} -> {settings.PreferredLanguage})");
                        result.TranslationCompleted = true;
                        result.TranslatedContent = translatedContent;
                        
                        await _aiMailSettingsService.UpdateAIFeatureUsageAsync(mail.AssignedAccount.Id, AIFeatureType.AutoTranslation);
                    }
                }
            }

            // 步骤3: 智能建议生成
            if (settings.SmartSuggestionsEnabled && result.Success)
            {
                _logger.Information("Generating smart suggestions for mail {MailId}", mail.Id);
                var suggestions = await GenerateMailSuggestionsAsync(mail, settings);
                if (suggestions.Any())
                {
                    steps.Add($"生成 {suggestions.Length} 个智能建议");
                    result.SuggestionsGenerated = true;
                    result.Suggestions = suggestions;
                    
                    await _aiMailSettingsService.UpdateAIFeatureUsageAsync(mail.AssignedAccount.Id, AIFeatureType.SmartSuggestions);
                }
            }

            // 步骤4: 智能回复选项（如果是重要邮件）
            if (settings.SmartReplyEnabled && result.Success && mail.AIImportanceScore >= settings.ImportanceThreshold)
            {
                _logger.Information("Generating smart reply options for important mail {MailId}", mail.Id);
                var replyOptions = await _aiMailTranslationService.GenerateReplyOptionsAsync(mail, settings.PreferredLanguage);
                if (replyOptions.Any())
                {
                    steps.Add($"生成 {replyOptions.Length} 个回复选项");
                    result.ReplyOptionsGenerated = true;
                    result.ReplyOptions = replyOptions;
                    
                    await _aiMailSettingsService.UpdateAIFeatureUsageAsync(mail.AssignedAccount.Id, AIFeatureType.SmartReply);
                }
            }

            result.ProcessingSteps = steps.ToArray();
            result.EndTime = DateTime.UtcNow;
            result.ProcessingDuration = result.EndTime - result.StartTime;

            _logger.Information("AI workflow completed for mail {MailId} in {Duration}ms", 
                mail.Id, result.ProcessingDuration.TotalMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error in AI workflow for mail {MailId}", mail?.Id);
            return new AIMailWorkflowResult
            {
                MailId = mail?.UniqueId ?? Guid.Empty,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow,
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    /// <summary>
    /// 批量处理邮件的AI工作流
    /// </summary>
    public async Task<AIBatchWorkflowResult> ProcessBatchMailWorkflowAsync(Guid accountId, int batchSize = 50)
    {
        try
        {
            _logger.Information("Starting batch AI workflow for account {AccountId} with batch size {BatchSize}", 
                accountId, batchSize);

            var result = new AIBatchWorkflowResult
            {
                AccountId = accountId,
                StartTime = DateTime.UtcNow,
                BatchSize = batchSize
            };

            // 获取未分析的邮件
            var unanalyzedMails = await _mailService.GetUnanalyzedMailsAsync(accountId);
            var mailsToProcess = unanalyzedMails.Take(batchSize).ToList();

            result.TotalMailsToProcess = mailsToProcess.Count;

            if (!mailsToProcess.Any())
            {
                _logger.Information("No unanalyzed mails found for account {AccountId}", accountId);
                result.Success = true;
                result.EndTime = DateTime.UtcNow;
                return result;
            }

            // 批量分析邮件
            var analysisResults = await _mailAIAnalysisService.BatchAnalyzeMailsAsync(mailsToProcess);
            result.SuccessfullyProcessed = analysisResults.Count(r => r != null);
            result.Failed = result.TotalMailsToProcess - result.SuccessfullyProcessed;

            // 为每个成功分析的邮件生成建议
            var settings = await _aiMailSettingsService.GetAIMailSettingsAsync(accountId);
            var allSuggestions = new List<AIMailSuggestion>();

            foreach (var mail in mailsToProcess.Where(m => m.IsAIAnalyzed))
            {
                var suggestions = await GenerateMailSuggestionsAsync(mail, settings);
                allSuggestions.AddRange(suggestions);
            }

            result.GeneratedSuggestions = allSuggestions.ToArray();
            result.Success = result.Failed == 0;
            result.EndTime = DateTime.UtcNow;
            result.ProcessingDuration = result.EndTime - result.StartTime;

            _logger.Information("Batch AI workflow completed for account {AccountId}. Processed: {Processed}, Failed: {Failed}", 
                accountId, result.SuccessfullyProcessed, result.Failed);

            return result;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error in batch AI workflow for account {AccountId}", accountId);
            return new AIBatchWorkflowResult
            {
                AccountId = accountId,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow,
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    /// <summary>
    /// 执行智能邮件管理工作流
    /// </summary>
    public async Task<AIManagementWorkflowResult> ExecuteSmartManagementWorkflowAsync(Guid accountId)
    {
        try
        {
            _logger.Information("Starting smart management workflow for account {AccountId}", accountId);

            var result = new AIManagementWorkflowResult
            {
                AccountId = accountId,
                StartTime = DateTime.UtcNow
            };

            // 获取管理建议
            var suggestions = await _aiMailAssistantService.GetMailManagementSuggestionsAsync(accountId);
            result.Suggestions = suggestions;

            // 自动执行低风险的建议
            var autoExecutableActions = new List<AIMailAction>();
            var settings = await _aiMailSettingsService.GetAIMailSettingsAsync(accountId);

            foreach (var suggestion in suggestions.Where(s => s.Priority == AIMailSuggestionPriority.Low))
            {
                var action = CreateActionFromSuggestion(suggestion);
                if (action != null && IsAutoExecutable(action, settings))
                {
                    autoExecutableActions.Add(action);
                }
            }

            // 执行自动操作
            var executedActions = new List<AIMailAction>();
            foreach (var action in autoExecutableActions)
            {
                var success = await _aiMailAssistantService.ExecuteSmartMailActionAsync(action);
                if (success)
                {
                    executedActions.Add(action);
                }
            }

            result.AutoExecutedActions = executedActions.ToArray();
            result.Success = true;
            result.EndTime = DateTime.UtcNow;
            result.ProcessingDuration = result.EndTime - result.StartTime;

            _logger.Information("Smart management workflow completed for account {AccountId}. Executed {Count} actions", 
                accountId, executedActions.Count);

            return result;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error in smart management workflow for account {AccountId}", accountId);
            return new AIManagementWorkflowResult
            {
                AccountId = accountId,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow,
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    private async Task<AIMailSuggestion[]> GenerateMailSuggestionsAsync(MailCopy mail, AIMailSettings settings)
    {
        var suggestions = new List<AIMailSuggestion>();

        // 基于AI分析结果生成建议
        if (mail.IsAIAnalyzed)
        {
            // 垃圾邮件建议
            if (mail.IsAISpam)
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.SpamCleanup,
                    Title = "垃圾邮件检测",
                    Description = "此邮件被识别为垃圾邮件，建议删除。",
                    Priority = AIMailSuggestionPriority.Medium,
                    ActionData = new { MailId = mail.Id }
                });
            }

            // 重要邮件建议
            if (mail.AIImportanceScore >= settings.ImportanceThreshold)
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.ImportantMailsAttention,
                    Title = "重要邮件提醒",
                    Description = $"此邮件重要性评分为 {mail.AIImportanceScore}，建议优先处理。",
                    Priority = AIMailSuggestionPriority.High,
                    ActionData = new { MailId = mail.Id }
                });
            }

            // 分类建议
            if (mail.AICategory != AIMailCategory.Other)
            {
                suggestions.Add(new AIMailSuggestion
                {
                    Type = AIMailSuggestionType.CategorizationSuggestion,
                    Title = "邮件分类",
                    Description = $"此邮件被分类为：{GetCategoryDisplayName(mail.AICategory)}",
                    Priority = AIMailSuggestionPriority.Low,
                    ActionData = new { MailId = mail.Id, Category = mail.AICategory }
                });
            }
        }

        return suggestions.ToArray();
    }

    private AIMailAction? CreateActionFromSuggestion(AIMailSuggestion suggestion)
    {
        return suggestion.Type switch
        {
            AIMailSuggestionType.SpamCleanup => new AIMailAction
            {
                Type = AIMailActionType.DeleteSpam,
                AccountId = Guid.Empty, // 需要从ActionData中获取
                MailIds = new[] { Guid.Empty } // 需要从ActionData中获取
            },
            _ => null
        };
    }

    private bool IsAutoExecutable(AIMailAction action, AIMailSettings settings)
    {
        return action.Type switch
        {
            AIMailActionType.AutoCategorize => settings.AutoCategorizationEnabled,
            AIMailActionType.DeleteSpam => settings.SpamDetectionEnabled,
            _ => false
        };
    }

    private string GetCategoryDisplayName(AIMailCategory category)
    {
        return category switch
        {
            AIMailCategory.Work => "工作邮件",
            AIMailCategory.Personal => "个人邮件",
            AIMailCategory.Finance => "财务邮件",
            AIMailCategory.Shopping => "购物邮件",
            AIMailCategory.Social => "社交邮件",
            AIMailCategory.Promotion => "推广邮件",
            AIMailCategory.Newsletter => "新闻邮件",
            _ => "其他"
        };
    }
}