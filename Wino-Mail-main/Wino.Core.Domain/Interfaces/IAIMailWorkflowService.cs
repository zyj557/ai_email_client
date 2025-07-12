using System;
using System.Threading.Tasks;
using Wino.Core.Domain.Entities.Mail;
using Wino.Core.Domain.Models.AI;

namespace Wino.Core.Domain.Interfaces;

/// <summary>
/// AI邮件工作流服务接口
/// </summary>
public interface IAIMailWorkflowService
{
    /// <summary>
    /// 处理新邮件的完整AI工作流
    /// </summary>
    /// <param name="mail">邮件对象</param>
    /// <returns>工作流结果</returns>
    Task<AIMailWorkflowResult> ProcessNewMailWorkflowAsync(MailCopy mail);

    /// <summary>
    /// 批量处理邮件的AI工作流
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <param name="batchSize">批量大小</param>
    /// <returns>批量工作流结果</returns>
    Task<AIBatchWorkflowResult> ProcessBatchMailWorkflowAsync(Guid accountId, int batchSize = 50);

    /// <summary>
    /// 执行智能邮件管理工作流
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>管理工作流结果</returns>
    Task<AIManagementWorkflowResult> ExecuteSmartManagementWorkflowAsync(Guid accountId);
}