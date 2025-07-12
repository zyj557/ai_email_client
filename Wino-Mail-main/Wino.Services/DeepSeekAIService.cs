using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Serilog;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Interfaces;
using Wino.Core.Domain.Models.AI;

namespace Wino.Services;

/// <summary>
/// DeepSeek AI服务实现，提供基于DeepSeek API的邮件智能分析功能
/// </summary>
public class DeepSeekAIService : IAIService
{
    private readonly ILogger _logger = Log.ForContext<DeepSeekAIService>();
    private readonly HttpClient _httpClient;
    private readonly IConfigurationService _configurationService;
    
    // DeepSeek API配置
    private const string DEEPSEEK_API_BASE_URL = "https://api.deepseek.com/v1";
    private const string DEEPSEEK_API_KEY_CONFIG = "DeepSeek_ApiKey";
    
    public DeepSeekAIService(HttpClient httpClient, IConfigurationService configurationService)
    {
        _httpClient = httpClient;
        _configurationService = configurationService;
        
        // 配置HTTP客户端
        _httpClient.BaseAddress = new Uri(DEEPSEEK_API_BASE_URL);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "Wino-Mail/1.0");
    }

    public async Task<bool> IsSpamAsync(MailCopy mailCopy)
    {
        try
        {
            var prompt = $@"请分析以下邮件是否为垃圾邮件。请只回答'是'或'否'。

发件人：{mailCopy.FromName} <{mailCopy.FromAddress}>
主题：{mailCopy.Subject}
内容预览：{mailCopy.PreviewText}";
            
            var response = await CallDeepSeekAPIAsync(prompt);
            return response.Contains("是") || response.ToLower().Contains("yes") || response.ToLower().Contains("spam");
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "DeepSeek垃圾邮件检测失败: {MailId}", mailCopy.Id);
            return false;
        }
    }

    public async Task<AIMailCategory> ClassifyMailAsync(MailCopy mailCopy)
    {
        try
        {
            var prompt = $@"请将以下邮件分类到以下类别之一：Work（工作）、Personal（个人）、Finance（财务）、Shopping（购物）、Social（社交）、News（新闻）、Education（教育）、Unclassified（未分类）。请只回答类别名称。

发件人：{mailCopy.FromName} <{mailCopy.FromAddress}>
主题：{mailCopy.Subject}
内容预览：{mailCopy.PreviewText}";
            
            var response = await CallDeepSeekAPIAsync(prompt);
            
            return response.ToLower() switch
            {
                var r when r.Contains("work") || r.Contains("工作") => AIMailCategory.Work,
                var r when r.Contains("personal") || r.Contains("个人") => AIMailCategory.Personal,
                var r when r.Contains("finance") || r.Contains("财务") => AIMailCategory.Finance,
                var r when r.Contains("shopping") || r.Contains("购物") => AIMailCategory.Shopping,
                var r when r.Contains("social") || r.Contains("社交") => AIMailCategory.Social,
                var r when r.Contains("news") || r.Contains("新闻") => AIMailCategory.News,
                var r when r.Contains("education") || r.Contains("教育") => AIMailCategory.Education,
                _ => AIMailCategory.Unclassified
            };
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "DeepSeek邮件分类失败: {MailId}", mailCopy.Id);
            return AIMailCategory.Unclassified;
        }
    }

    public async Task<int> EvaluateImportanceAsync(MailCopy mailCopy)
    {
        try
        {
            var prompt = $@"请评估以下邮件的重要性，给出0-5的评分（0=不重要，5=非常重要）。请只回答数字。

发件人：{mailCopy.FromName} <{mailCopy.FromAddress}>
主题：{mailCopy.Subject}
内容预览：{mailCopy.PreviewText}
是否有附件：{(mailCopy.HasAttachments ? "是" : "否")}
是否已标记：{(mailCopy.IsFlagged ? "是" : "否")}";
            
            var response = await CallDeepSeekAPIAsync(prompt);
            
            if (int.TryParse(response.Trim(), out int score))
            {
                return Math.Min(5, Math.Max(0, score));
            }
            
            return 0;
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "DeepSeek重要性评估失败: {MailId}", mailCopy.Id);
            return 0;
        }
    }

    public async Task<string> TranslateContentAsync(string content, AILanguage targetLanguage)
    {
        try
        {
            if (string.IsNullOrEmpty(content))
                return content;
            
            var targetLang = targetLanguage switch
            {
                AILanguage.Chinese => "中文",
                AILanguage.English => "English",
                _ => "English"
            };
            
            var prompt = $@"请将以下内容翻译为{targetLang}：

{content}";
            
            return await CallDeepSeekAPIAsync(prompt);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "DeepSeek内容翻译失败");
            return content;
        }
    }

    public async Task<string> GenerateAutoReplyAsync(MailCopy originalMail, AILanguage language)
    {
        try
        {
            var lang = language == AILanguage.Chinese ? "中文" : "English";
            
            var prompt = $@"请为以下邮件生成一个礼貌的自动回复，使用{lang}。回复应该简洁、专业。

原邮件发件人：{originalMail.FromName} <{originalMail.FromAddress}>
原邮件主题：{originalMail.Subject}
原邮件内容预览：{originalMail.PreviewText}";
            
            return await CallDeepSeekAPIAsync(prompt);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "DeepSeek自动回复生成失败: {MailId}", originalMail.Id);
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
                    Confidence = 0.9, // DeepSeek通常有较高的置信度
                    Notes = "DeepSeek AI自动分析"
                };
                
                results.Add(result);
                
                // 添加延迟以避免API限制
                await Task.Delay(100);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "DeepSeek邮件分析失败: {MailId}", mail.Id);
            }
        }
        
        return results;
    }
    
    #region 私有方法
    
    /// <summary>
    /// 调用DeepSeek API
    /// </summary>
    /// <param name="prompt">提示词</param>
    /// <returns>API响应</returns>
    private async Task<string> CallDeepSeekAPIAsync(string prompt)
    {
        var apiKey = _configurationService.Get<string>(DEEPSEEK_API_KEY_CONFIG);
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("DeepSeek API密钥未配置");
        }
        
        var requestBody = new
        {
            model = "deepseek-chat",
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            max_tokens = 1000,
            temperature = 0.1
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        _httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        
        var response = await _httpClient.PostAsync("/chat/completions", content);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"DeepSeek API调用失败: {response.StatusCode}, {errorContent}");
        }
        
        var responseJson = await response.Content.ReadAsStringAsync();
        var responseObj = JsonSerializer.Deserialize<JsonElement>(responseJson);
        
        return responseObj
            .GetProperty("choices")
            .EnumerateArray()
            .First()
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;
    }
    
    #endregion
}