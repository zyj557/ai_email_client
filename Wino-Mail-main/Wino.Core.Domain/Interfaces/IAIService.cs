using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Models.AI;

namespace Wino.Core.Domain.Interfaces;

/// <summary>
/// AI服务接口，提供邮件智能分析功能
/// </summary>
public interface IAIService
{
    /// <summary>
    /// 检测邮件是否为垃圾邮件
    /// </summary>
    /// <param name="mailCopy">邮件副本</param>
    /// <returns>是否为垃圾邮件</returns>
    Task<bool> IsSpamAsync(MailCopy mailCopy);

    /// <summary>
    /// 对邮件进行自动分类
    /// </summary>
    /// <param name="mailCopy">邮件副本</param>
    /// <returns>分类结果</returns>
    Task<AIMailCategory> ClassifyMailAsync(MailCopy mailCopy);

    /// <summary>
    /// 评估邮件重要性
    /// </summary>
    /// <param name="mailCopy">邮件副本</param>
    /// <returns>重要性评分(0-5)</returns>
    Task<int> EvaluateImportanceAsync(MailCopy mailCopy);

    /// <summary>
    /// 翻译邮件内容
    /// </summary>
    /// <param name="content">邮件内容</param>
    /// <param name="targetLanguage">目标语言</param>
    /// <returns>翻译后的内容</returns>
    Task<string> TranslateContentAsync(string content, AILanguage targetLanguage);

    /// <summary>
    /// 生成自动回复内容
    /// </summary>
    /// <param name="originalMail">原始邮件</param>
    /// <param name="language">回复语言</param>
    /// <returns>自动回复内容</returns>
    Task<string> GenerateAutoReplyAsync(MailCopy originalMail, AILanguage language);

    /// <summary>
    /// 批量处理邮件AI分析
    /// </summary>
    /// <param name="mailCopies">邮件列表</param>
    /// <returns>AI分析结果</returns>
    Task<List<AIMailAnalysisResult>> BatchAnalyzeMailsAsync(List<MailCopy> mailCopies);
}