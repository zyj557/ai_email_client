using System;
using System.Threading.Tasks;
using Wino.Core.Domain.Models.AI;

namespace Wino.Core.Domain.Interfaces;

/// <summary>
/// AI邮件智能助手服务接口
/// </summary>
public interface IAIMailAssistantService
{
    /// <summary>
    /// 获取邮件管理建议
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>邮件管理建议数组</returns>
    Task<AIMailSuggestion[]> GetMailManagementSuggestionsAsync(Guid accountId);

    /// <summary>
    /// 执行智能邮件操作
    /// </summary>
    /// <param name="action">邮件操作</param>
    /// <returns>操作是否成功</returns>
    Task<bool> ExecuteSmartMailActionAsync(AIMailAction action);

    /// <summary>
    /// 获取邮件处理统计
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>邮件统计信息</returns>
    Task<AIMailStatistics> GetMailStatisticsAsync(Guid accountId);

    /// <summary>
    /// 生成邮件处理报告
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <param name="reportType">报告类型</param>
    /// <returns>报告内容</returns>
    Task<string> GenerateMailReportAsync(Guid accountId, AIReportType reportType);
}