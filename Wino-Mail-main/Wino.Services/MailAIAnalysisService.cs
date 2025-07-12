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
/// 邮件AI分析服务，负责对邮件进行智能分析和分类
/// </summary>
public class MailAIAnalysisService : IMailAIAnalysisService
{
    private readonly IAIService _aiService;
    private readonly IMailService _mailService;
    private readonly IFolderService _folderService;
    private readonly ILogger _logger = Log.ForContext<MailAIAnalysisService>();

    public MailAIAnalysisService(
        IAIService aiService,
        IMailService mailService,
        IFolderService folderService)
    {
        _aiService = aiService;
        _mailService = mailService;
        _folderService = folderService;
    }

    /// <summary>
    /// 对单封邮件进行AI分析
    /// </summary>
    public async Task<AIMailAnalysisResult> AnalyzeMailAsync(MailCopy mail)
    {
        try
        {
            if (mail.IsAIAnalyzed)
            {
                _logger.Debug("Mail {MailId} already analyzed, skipping", mail.Id);
                return CreateAnalysisResultFromMail(mail);
            }

            _logger.Information("Starting AI analysis for mail {MailId}", mail.Id);

            // 垃圾邮件检测
            var isSpam = await _aiService.IsSpamAsync(mail);
            
            // 如果是垃圾邮件，不进行进一步分析
            if (isSpam)
            {
                var spamResult = new AIMailAnalysisResult
                {
                    MailUniqueId = mail.UniqueId,
                    IsSpam = true,
                    Category = AIMailCategory.Unclassified,
                    ImportanceScore = 0,
                    AnalyzedAt = DateTime.UtcNow,
                    Confidence = 0.9f,
                    Notes = "Detected as spam"
                };

                await UpdateMailWithAnalysisResultAsync(mail, spamResult);
                return spamResult;
            }

            // 邮件分类
            var category = await _aiService.ClassifyMailAsync(mail);
            
            // 重要性评估
            var importance = await _aiService.EvaluateImportanceAsync(mail);

            var result = new AIMailAnalysisResult
            {
                MailUniqueId = mail.UniqueId,
                IsSpam = false,
                Category = category,
                ImportanceScore = importance,
                AnalyzedAt = DateTime.UtcNow,
                Confidence = 0.8f,
                Notes = $"Classified as {category}, Importance: {importance}"
            };

            await UpdateMailWithAnalysisResultAsync(mail, result);
            
            _logger.Information("AI analysis completed for mail {MailId}: Spam={IsSpam}, Category={Category}, Importance={Importance}", 
                mail.Id, result.IsSpam, result.Category, result.ImportanceScore);

            return result;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error analyzing mail {MailId}", mail.Id);
            
            // 返回默认分析结果
            return new AIMailAnalysisResult
            {
                MailUniqueId = mail.UniqueId,
                IsSpam = false,
                Category = AIMailCategory.Unclassified,
                ImportanceScore = 2,
                AnalyzedAt = DateTime.UtcNow,
                Confidence = 0.1f,
                Notes = "Analysis failed, using default values"
            };
        }
    }

    /// <summary>
    /// 批量分析邮件
    /// </summary>
    public async Task<List<AIMailAnalysisResult>> BatchAnalyzeMailsAsync(List<MailCopy> mails)
    {
        var results = new List<AIMailAnalysisResult>();
        
        // 过滤出未分析的邮件
        var unanalyzedMails = mails.Where(m => !m.IsAIAnalyzed).ToList();
        
        if (!unanalyzedMails.Any())
        {
            _logger.Debug("No unanalyzed mails found in batch");
            return results;
        }

        _logger.Information("Starting batch AI analysis for {Count} mails", unanalyzedMails.Count);

        // 使用AI服务的批量分析功能
        var batchResults = await _aiService.BatchAnalyzeMailsAsync(unanalyzedMails);
        
        foreach (var result in batchResults)
        {
            var mail = unanalyzedMails.FirstOrDefault(m => m.UniqueId == result.MailUniqueId);
            if (mail != null)
            {
                await UpdateMailWithAnalysisResultAsync(mail, result);
                results.Add(result);
            }
        }

        _logger.Information("Batch AI analysis completed for {Count} mails", results.Count);
        return results;
    }

    /// <summary>
    /// 为账户分析所有未分析的邮件
    /// </summary>
    public async Task AnalyzeAccountMailsAsync(Guid accountId)
    {
        try
        {
            _logger.Information("Starting AI analysis for all mails in account {AccountId}", accountId);

            // 获取所有未分析的邮件
            var unanalyzedMails = await _mailService.GetUnanalyzedMailsAsync(accountId);
            
            if (!unanalyzedMails.Any())
            {
                _logger.Information("No unanalyzed mails found for account {AccountId}", accountId);
                return;
            }

            // 分批处理，避免内存占用过大
            const int batchSize = 50;
            var totalBatches = (int)Math.Ceiling((double)unanalyzedMails.Count / batchSize);
            
            for (int i = 0; i < totalBatches; i++)
            {
                var batch = unanalyzedMails.Skip(i * batchSize).Take(batchSize).ToList();
                await BatchAnalyzeMailsAsync(batch);
                
                _logger.Debug("Completed batch {Current}/{Total} for account {AccountId}", 
                    i + 1, totalBatches, accountId);
            }

            _logger.Information("AI analysis completed for account {AccountId}, processed {Count} mails", 
                accountId, unanalyzedMails.Count);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error analyzing mails for account {AccountId}", accountId);
        }
    }

    /// <summary>
    /// 重新分析指定邮件
    /// </summary>
    public async Task ReanalyzeMailAsync(string mailId)
    {
        try
        {
            var mail = await _mailService.GetMailAsync(mailId);
            if (mail == null)
            {
                _logger.Warning("Mail {MailId} not found for reanalysis", mailId);
                return;
            }

            // 重置分析状态
            mail.IsAIAnalyzed = false;
            mail.AIAnalyzedAt = null;
            
            // 重新分析
            await AnalyzeMailAsync(mail);
            
            _logger.Information("Mail {MailId} reanalyzed successfully", mailId);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error reanalyzing mail {MailId}", mailId);
        }
    }

    private async Task UpdateMailWithAnalysisResultAsync(MailCopy mail, AIMailAnalysisResult result)
    {
        mail.IsAISpam = result.IsSpam;
        mail.AICategory = result.Category;
        mail.AIImportanceScore = result.ImportanceScore;
        mail.IsAIAnalyzed = true;
        mail.AIAnalyzedAt = result.AnalyzedAt;

        await _mailService.UpdateMailAsync(mail);
    }

    private AIMailAnalysisResult CreateAnalysisResultFromMail(MailCopy mail)
    {
        return new AIMailAnalysisResult
        {
            MailUniqueId = mail.UniqueId,
            IsSpam = mail.IsAISpam,
            Category = mail.AICategory,
            ImportanceScore = mail.AIImportanceScore,
            AnalyzedAt = mail.AIAnalyzedAt ?? DateTime.UtcNow,
            Confidence = 1.0f,
            Notes = "Previously analyzed"
        };
    }
}