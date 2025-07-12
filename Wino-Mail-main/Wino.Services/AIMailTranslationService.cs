using System;
using System.Threading.Tasks;
using Serilog;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Interfaces;
using Wino.Core.Domain.Models.AI;

namespace Wino.Services;

/// <summary>
/// AI邮件翻译和自动回复服务
/// </summary>
public class AIMailTranslationService : IAIMailTranslationService
{
    private readonly IAIService _aiService;
    private readonly ILogger _logger = Log.ForContext<AIMailTranslationService>();

    public AIMailTranslationService(IAIService aiService)
    {
        _aiService = aiService;
    }

    /// <summary>
    /// 翻译邮件内容
    /// </summary>
    public async Task<string> TranslateMailContentAsync(MailCopy mail, AILanguage targetLanguage)
    {
        try
        {
            if (mail == null)
            {
                throw new ArgumentNullException(nameof(mail));
            }

            _logger.Information("Translating mail {MailId} to {TargetLanguage}", mail.Id, targetLanguage);

            var content = !string.IsNullOrEmpty(mail.PreviewText) ? mail.PreviewText : mail.Subject;
            
            if (string.IsNullOrEmpty(content))
            {
                _logger.Warning("No content to translate for mail {MailId}", mail.Id);
                return string.Empty;
            }

            var translatedContent = await _aiService.TranslateContentAsync(content, targetLanguage);
            
            _logger.Information("Translation completed for mail {MailId}", mail.Id);
            return translatedContent;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error translating mail {MailId}", mail?.Id);
            return "翻译失败，请稍后重试。";
        }
    }

    /// <summary>
    /// 翻译邮件主题
    /// </summary>
    public async Task<string> TranslateMailSubjectAsync(MailCopy mail, AILanguage targetLanguage)
    {
        try
        {
            if (mail == null || string.IsNullOrEmpty(mail.Subject))
            {
                return string.Empty;
            }

            _logger.Information("Translating mail subject {MailId} to {TargetLanguage}", mail.Id, targetLanguage);

            var translatedSubject = await _aiService.TranslateContentAsync(mail.Subject, targetLanguage);
            
            _logger.Information("Subject translation completed for mail {MailId}", mail.Id);
            return translatedSubject;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error translating mail subject {MailId}", mail?.Id);
            return mail?.Subject ?? string.Empty;
        }
    }

    /// <summary>
    /// 生成自动回复内容
    /// </summary>
    public async Task<string> GenerateAutoReplyAsync(MailCopy originalMail, AILanguage replyLanguage)
    {
        try
        {
            if (originalMail == null)
            {
                throw new ArgumentNullException(nameof(originalMail));
            }

            _logger.Information("Generating auto reply for mail {MailId} in {ReplyLanguage}", originalMail.Id, replyLanguage);

            var autoReply = await _aiService.GenerateAutoReplyAsync(originalMail, replyLanguage);
            
            _logger.Information("Auto reply generated for mail {MailId}", originalMail.Id);
            return autoReply;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error generating auto reply for mail {MailId}", originalMail?.Id);
            
            // 返回默认回复内容
            return replyLanguage switch
            {
                AILanguage.Chinese => "感谢您的邮件，我会尽快回复您。",
                AILanguage.English => "Thank you for your email. I will get back to you soon.",
                _ => "Thank you for your email. I will get back to you soon."
            };
        }
    }

    /// <summary>
    /// 生成智能回复建议
    /// </summary>
    public async Task<string[]> GenerateReplyOptionsAsync(MailCopy originalMail, AILanguage replyLanguage)
    {
        try
        {
            if (originalMail == null)
            {
                throw new ArgumentNullException(nameof(originalMail));
            }

            _logger.Information("Generating reply options for mail {MailId} in {ReplyLanguage}", originalMail.Id, replyLanguage);

            // 根据邮件内容和分类生成多个回复选项
            var options = new string[3];
            
            // 基础自动回复
            options[0] = await GenerateAutoReplyAsync(originalMail, replyLanguage);
            
            // 根据邮件分类生成特定回复
            if (originalMail.IsAIAnalyzed)
            {
                options[1] = await GenerateCategorySpecificReplyAsync(originalMail, replyLanguage);
                options[2] = await GenerateDetailedReplyAsync(originalMail, replyLanguage);
            }
            else
            {
                // 如果未分析，提供通用选项
                options[1] = GenerateGenericReply(replyLanguage, "professional");
                options[2] = GenerateGenericReply(replyLanguage, "friendly");
            }
            
            _logger.Information("Reply options generated for mail {MailId}", originalMail.Id);
            return options;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error generating reply options for mail {MailId}", originalMail?.Id);
            
            // 返回默认选项
            return replyLanguage switch
            {
                AILanguage.Chinese => new[] 
                {
                    "感谢您的邮件，我会尽快回复您。",
                    "收到您的邮件，我正在处理相关事宜。",
                    "谢谢您的来信，我会认真考虑您的建议。"
                },
                AILanguage.English => new[] 
                {
                    "Thank you for your email. I will get back to you soon.",
                    "I have received your email and am working on it.",
                    "Thank you for reaching out. I will consider your suggestions."
                },
                _ => new[] 
                {
                    "Thank you for your email. I will get back to you soon.",
                    "I have received your email and am working on it.",
                    "Thank you for reaching out. I will consider your suggestions."
                }
            };
        }
    }

    private async Task<string> GenerateCategorySpecificReplyAsync(MailCopy mail, AILanguage language)
    {
        var category = mail.AICategory;
        
        return category switch
        {
            AIMailCategory.Work => language == AILanguage.Chinese 
                ? "感谢您的工作邮件，我会在工作时间内回复您。" 
                : "Thank you for your work-related email. I will respond during business hours.",
            AIMailCategory.Personal => language == AILanguage.Chinese 
                ? "谢谢您的来信，很高兴收到您的消息。" 
                : "Thank you for your message. It's great to hear from you.",
            AIMailCategory.Finance => language == AILanguage.Chinese 
                ? "收到您关于财务的邮件，我会仔细审查并回复。" 
                : "I have received your finance-related email and will review it carefully.",
            AIMailCategory.Shopping => language == AILanguage.Chinese 
                ? "感谢您的购物咨询，我会为您提供相关信息。" 
                : "Thank you for your shopping inquiry. I will provide you with the relevant information.",
            _ => await GenerateAutoReplyAsync(mail, language)
        };
    }

    private async Task<string> GenerateDetailedReplyAsync(MailCopy mail, AILanguage language)
    {
        var importance = mail.AIImportanceScore;
        
        if (importance >= 4)
        {
            return language == AILanguage.Chinese 
                ? "感谢您的重要邮件，我会优先处理并尽快回复您。" 
                : "Thank you for your important email. I will prioritize this and get back to you promptly.";
        }
        else
        {
            return language == AILanguage.Chinese 
                ? "感谢您的邮件，我会在合适的时间回复您。" 
                : "Thank you for your email. I will respond at an appropriate time.";
        }
    }

    private string GenerateGenericReply(AILanguage language, string tone)
    {
        return (language, tone) switch
        {
            (AILanguage.Chinese, "professional") => "感谢您的邮件，我会尽快处理并回复您。",
            (AILanguage.Chinese, "friendly") => "谢谢您的来信！我会尽快回复您的。",
            (AILanguage.English, "professional") => "Thank you for your email. I will process it and respond promptly.",
            (AILanguage.English, "friendly") => "Thanks for your email! I'll get back to you soon.",
            _ => "Thank you for your email. I will get back to you soon."
        };
    }

    /// <summary>
    /// 检测邮件语言
    /// </summary>
    public AILanguage DetectMailLanguage(MailCopy mail)
    {
        try
        {
            if (mail == null)
            {
                return AILanguage.Auto;
            }

            var content = mail.Subject + " " + mail.PreviewText;
            
            if (string.IsNullOrEmpty(content))
            {
                return AILanguage.Auto;
            }

            // 简单的语言检测逻辑
            var chineseCharCount = 0;
            var englishCharCount = 0;
            
            foreach (char c in content)
            {
                if (c >= 0x4e00 && c <= 0x9fff) // 中文字符范围
                {
                    chineseCharCount++;
                }
                else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'))
                {
                    englishCharCount++;
                }
            }

            if (chineseCharCount > englishCharCount)
            {
                return AILanguage.Chinese;
            }
            else if (englishCharCount > chineseCharCount)
            {
                return AILanguage.English;
            }
            else
            {
                return AILanguage.Auto;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Error detecting language for mail {MailId}", mail?.Id);
            return AILanguage.Auto;
        }
    }
}