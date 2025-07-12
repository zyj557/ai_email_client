using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Models.AI;

namespace Wino.Core.Domain.Interfaces;

/// <summary>
/// 邮件AI分析服务接口
/// </summary>
public interface IMailAIAnalysisService
{
    /// <summary>
    /// 对单封邮件进行AI分析
    /// </summary>
    /// <param name="mail">要分析的邮件</param>
    /// <returns>分析结果</returns>
    Task<AIMailAnalysisResult> AnalyzeMailAsync(MailCopy mail);

    /// <summary>
    /// 批量分析邮件
    /// </summary>
    /// <param name="mails">要分析的邮件列表</param>
    /// <returns>分析结果列表</returns>
    Task<List<AIMailAnalysisResult>> BatchAnalyzeMailsAsync(List<MailCopy> mails);

    /// <summary>
    /// 为账户分析所有未分析的邮件
    /// </summary>
    /// <param name="accountId">账户ID</param>
    Task AnalyzeAccountMailsAsync(Guid accountId);

    /// <summary>
    /// 重新分析指定邮件
    /// </summary>
    /// <param name="mailId">邮件ID</param>
    Task ReanalyzeMailAsync(string mailId);
}