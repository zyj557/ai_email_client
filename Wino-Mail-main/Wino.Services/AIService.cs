using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Serilog;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Interfaces;
using Wino.Core.Domain.Models.AI;

namespace Wino.Services;

/// <summary>
/// AI服务实现，提供邮件智能分析功能
/// </summary>
public class AIService : IAIService
{
    private readonly ILogger _logger = Log.ForContext<AIService>();
    
    // 垃圾邮件关键词
    private readonly string[] _spamKeywords = 
    {
        "免费", "赚钱", "中奖", "优惠", "促销", "限时", "急售", "投资", "贷款", "彩票",
        "free", "money", "win", "prize", "discount", "sale", "urgent", "investment", "loan", "lottery",
        "viagra", "casino", "gambling", "debt", "credit", "mortgage", "refinance"
    };
    
    // 工作相关关键词
    private readonly string[] _workKeywords = 
    {
        "会议", "项目", "报告", "工作", "任务", "截止日期", "客户", "合同", "预算", "团队",
        "meeting", "project", "report", "work", "task", "deadline", "client", "contract", "budget", "team",
        "office", "business", "proposal", "presentation", "schedule", "conference", "colleague"
    };
    
    // 个人相关关键词
    private readonly string[] _personalKeywords = 
    {
        "家庭", "朋友", "生日", "聚会", "假期", "旅行", "爱好", "兴趣", "个人",
        "family", "friend", "birthday", "party", "holiday", "vacation", "hobby", "personal",
        "wedding", "anniversary", "celebration", "weekend", "dinner", "lunch"
    };
    
    // 财务相关关键词
    private readonly string[] _financeKeywords = 
    {
        "银行", "账单", "付款", "发票", "税务", "保险", "投资", "股票", "基金", "理财",
        "bank", "bill", "payment", "invoice", "tax", "insurance", "investment", "stock", "fund", "finance",
        "credit card", "mortgage", "loan", "interest", "account", "transaction", "receipt"
    };
    
    // 购物相关关键词
    private readonly string[] _shoppingKeywords = 
    {
        "购买", "订单", "发货", "快递", "商品", "价格", "折扣", "优惠券", "退货", "评价",
        "purchase", "order", "shipping", "delivery", "product", "price", "discount", "coupon", "return", "review",
        "amazon", "ebay", "shopping", "cart", "checkout", "payment", "refund"
    };

    public async Task<bool> IsSpamAsync(MailCopy mailCopy)
    {
        try
        {
            var content = $"{mailCopy.Subject} {mailCopy.PreviewText} {mailCopy.FromName} {mailCopy.FromAddress}";
            content = content.ToLower();
            
            // 检查垃圾邮件关键词
            var spamScore = 0;
            foreach (var keyword in _spamKeywords)
            {
                if (content.Contains(keyword.ToLower()))
                {
                    spamScore++;
                }
            }
            
            // 检查可疑发件人模式
            if (IsFromSuspiciousSender(mailCopy.FromAddress, mailCopy.FromName))
            {
                spamScore += 2;
            }
            
            // 检查主题行模式
            if (HasSuspiciousSubject(mailCopy.Subject))
            {
                spamScore += 2;
            }
            
            // 如果评分超过阈值，认为是垃圾邮件
            return spamScore >= 3;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "垃圾邮件检测失败: {MailId}", mailCopy.Id);
            return false;
        }
    }

    public async Task<AIMailCategory> ClassifyMailAsync(MailCopy mailCopy)
    {
        try
        {
            var content = $"{mailCopy.Subject} {mailCopy.PreviewText}";
            content = content.ToLower();
            
            var scores = new Dictionary<AIMailCategory, int>();
            
            // 计算各分类的匹配分数
            scores[AIMailCategory.Work] = CountKeywordMatches(content, _workKeywords);
            scores[AIMailCategory.Personal] = CountKeywordMatches(content, _personalKeywords);
            scores[AIMailCategory.Finance] = CountKeywordMatches(content, _financeKeywords);
            scores[AIMailCategory.Shopping] = CountKeywordMatches(content, _shoppingKeywords);
            
            // 特殊规则检查
            if (IsFromKnownService(mailCopy.FromAddress, "social"))
                scores[AIMailCategory.Social] = scores.GetValueOrDefault(AIMailCategory.Social, 0) + 3;
            
            if (IsFromKnownService(mailCopy.FromAddress, "news"))
                scores[AIMailCategory.News] = scores.GetValueOrDefault(AIMailCategory.News, 0) + 3;
            
            if (IsFromKnownService(mailCopy.FromAddress, "education"))
                scores[AIMailCategory.Education] = scores.GetValueOrDefault(AIMailCategory.Education, 0) + 3;
            
            // 返回得分最高的分类
            var maxScore = scores.Values.DefaultIfEmpty(0).Max();
            if (maxScore >= 2)
            {
                return scores.FirstOrDefault(x => x.Value == maxScore).Key;
            }
            
            return AIMailCategory.Unclassified;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "邮件分类失败: {MailId}", mailCopy.Id);
            return AIMailCategory.Unclassified;
        }
    }

    public async Task<int> EvaluateImportanceAsync(MailCopy mailCopy)
    {
        try
        {
            var importance = 0;
            
            // 基于发件人重要性
            if (IsFromImportantSender(mailCopy.FromAddress))
                importance += 2;
            
            // 基于主题重要性
            if (HasUrgentSubject(mailCopy.Subject))
                importance += 2;
            
            // 基于内容重要性
            if (HasImportantContent(mailCopy.PreviewText))
                importance += 1;
            
            // 基于是否有附件
            if (mailCopy.HasAttachments)
                importance += 1;
            
            // 基于是否已标记为重要
            if (mailCopy.IsFlagged)
                importance += 1;
            
            // 确保评分在0-5范围内
            return Math.Min(5, Math.Max(0, importance));
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "重要性评估失败: {MailId}", mailCopy.Id);
            return 0;
        }
    }

    public async Task<string> TranslateContentAsync(string content, AILanguage targetLanguage)
    {
        try
        {
            // 这里应该集成真实的翻译API，如Google Translate或Azure Translator
            // 目前返回模拟翻译结果
            
            if (string.IsNullOrEmpty(content))
                return content;
            
            switch (targetLanguage)
            {
                case AILanguage.Chinese:
                    return $"[翻译为中文] {content}";
                case AILanguage.English:
                    return $"[Translated to English] {content}";
                default:
                    return content;
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "内容翻译失败");
            return content;
        }
    }

    public async Task<string> GenerateAutoReplyAsync(MailCopy originalMail, AILanguage language)
    {
        try
        {
            var templates = GetAutoReplyTemplates(language);
            
            // 基于原邮件内容选择合适的回复模板
            if (IsWorkRelated(originalMail))
            {
                return templates["work"];
            }
            else if (IsPersonalMail(originalMail))
            {
                return templates["personal"];
            }
            else
            {
                return templates["general"];
            }
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "自动回复生成失败: {MailId}", originalMail.Id);
            return language == AILanguage.Chinese ? "感谢您的邮件，我会尽快回复。" : "Thank you for your email. I will reply as soon as possible.";
        }
    }

    public async Task<List<AIMailAnalysisResult>> BatchAnalyzeMailsAsync(List<MailCopy> mailCopies)
    {
        var results = new List<AIMailAnalysisResult>();
        
        foreach (var mail in mailCopies)
        {
            try
            {
                var result = new AIMailAnalysisResult
                {
                    MailUniqueId = mail.UniqueId,
                    IsSpam = await IsSpamAsync(mail),
                    Category = await ClassifyMailAsync(mail),
                    ImportanceScore = await EvaluateImportanceAsync(mail),
                    AnalyzedAt = DateTime.UtcNow,
                    Confidence = 0.8, // 模拟置信度
                    Notes = "AI自动分析"
                };
                
                results.Add(result);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "邮件分析失败: {MailId}", mail.Id);
            }
        }
        
        return results;
    }
    
    #region 私有辅助方法
    
    private bool IsFromSuspiciousSender(string fromAddress, string fromName)
    {
        if (string.IsNullOrEmpty(fromAddress))
            return false;
            
        // 检查可疑域名
        var suspiciousDomains = new[] { "tempmail", "10minutemail", "guerrillamail", "mailinator" };
        return suspiciousDomains.Any(domain => fromAddress.ToLower().Contains(domain));
    }
    
    private bool HasSuspiciousSubject(string subject)
    {
        if (string.IsNullOrEmpty(subject))
            return false;
            
        var suspiciousPatterns = new[]
        {
            @"RE:\s*RE:\s*RE:", // 多重回复
            @"!!!", // 多个感叹号
            @"\$\d+", // 金钱符号
            @"[A-Z]{5,}", // 全大写单词
        };
        
        return suspiciousPatterns.Any(pattern => Regex.IsMatch(subject, pattern));
    }
    
    private int CountKeywordMatches(string content, string[] keywords)
    {
        return keywords.Count(keyword => content.Contains(keyword.ToLower()));
    }
    
    private bool IsFromKnownService(string fromAddress, string serviceType)
    {
        if (string.IsNullOrEmpty(fromAddress))
            return false;
            
        var serviceDomains = serviceType.ToLower() switch
        {
            "social" => new[] { "facebook", "twitter", "linkedin", "instagram", "weibo", "wechat" },
            "news" => new[] { "news", "newsletter", "media", "press", "journal" },
            "education" => new[] { "edu", "university", "school", "college", "academy" },
            _ => new string[0]
        };
        
        return serviceDomains.Any(domain => fromAddress.ToLower().Contains(domain));
    }
    
    private bool IsFromImportantSender(string fromAddress)
    {
        if (string.IsNullOrEmpty(fromAddress))
            return false;
            
        // 检查是否来自重要域名
        var importantDomains = new[] { "gov", "bank", "company", "boss", "ceo", "manager" };
        return importantDomains.Any(domain => fromAddress.ToLower().Contains(domain));
    }
    
    private bool HasUrgentSubject(string subject)
    {
        if (string.IsNullOrEmpty(subject))
            return false;
            
        var urgentKeywords = new[] { "urgent", "asap", "immediate", "emergency", "紧急", "立即", "马上", "重要" };
        return urgentKeywords.Any(keyword => subject.ToLower().Contains(keyword.ToLower()));
    }
    
    private bool HasImportantContent(string content)
    {
        if (string.IsNullOrEmpty(content))
            return false;
            
        var importantKeywords = new[] { "contract", "agreement", "legal", "court", "lawsuit", "合同", "协议", "法律", "法院" };
        return importantKeywords.Any(keyword => content.ToLower().Contains(keyword.ToLower()));
    }
    
    private bool IsWorkRelated(MailCopy mail)
    {
        var content = $"{mail.Subject} {mail.PreviewText}".ToLower();
        return CountKeywordMatches(content, _workKeywords) >= 2;
    }
    
    private bool IsPersonalMail(MailCopy mail)
    {
        var content = $"{mail.Subject} {mail.PreviewText}".ToLower();
        return CountKeywordMatches(content, _personalKeywords) >= 2;
    }
    
    private Dictionary<string, string> GetAutoReplyTemplates(AILanguage language)
    {
        return language switch
        {
            AILanguage.Chinese => new Dictionary<string, string>
            {
                ["work"] = "感谢您的邮件。我已收到您的工作相关邮件，会在24小时内回复。如有紧急事务，请直接致电。",
                ["personal"] = "谢谢您的邮件！我会尽快回复您。",
                ["general"] = "感谢您的邮件，我会尽快处理并回复。"
            },
            AILanguage.English => new Dictionary<string, string>
            {
                ["work"] = "Thank you for your email. I have received your work-related message and will respond within 24 hours. For urgent matters, please call directly.",
                ["personal"] = "Thank you for your email! I will get back to you soon.",
                ["general"] = "Thank you for your email. I will process it and respond as soon as possible."
            },
            _ => new Dictionary<string, string>
            {
                ["work"] = "Thank you for your email. I will respond soon.",
                ["personal"] = "Thank you for your email. I will get back to you.",
                ["general"] = "Thank you for your email."
            }
        };
    }
    
    #endregion
}