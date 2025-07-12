using System;
using System.Threading.Tasks;
using Wino.Core.Domain.Enums;
using Wino.Core.Domain.Models.AI;

namespace Wino.Core.Domain.Interfaces;

/// <summary>
/// AI邮件设置服务接口
/// </summary>
public interface IAIMailSettingsService
{
    /// <summary>
    /// 获取AI邮件设置
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>AI邮件设置</returns>
    Task<AIMailSettings> GetAIMailSettingsAsync(Guid accountId);

    /// <summary>
    /// 保存AI邮件设置
    /// </summary>
    /// <param name="settings">AI邮件设置</param>
    /// <returns>保存是否成功</returns>
    Task<bool> SaveAIMailSettingsAsync(AIMailSettings settings);

    /// <summary>
    /// 重置AI邮件设置为默认值
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>重置是否成功</returns>
    Task<bool> ResetAIMailSettingsAsync(Guid accountId);

    /// <summary>
    /// 更新特定AI功能的启用状态
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <param name="featureType">功能类型</param>
    /// <param name="enabled">是否启用</param>
    /// <returns>更新是否成功</returns>
    Task<bool> UpdateAIFeatureStatusAsync(Guid accountId, AIFeatureType featureType, bool enabled);

    /// <summary>
    /// 获取AI功能使用统计
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <returns>使用统计</returns>
    Task<AIFeatureUsageStatistics> GetAIFeatureUsageStatisticsAsync(Guid accountId);

    /// <summary>
    /// 更新AI功能使用统计
    /// </summary>
    /// <param name="accountId">账户ID</param>
    /// <param name="featureType">功能类型</param>
    /// <returns>更新是否成功</returns>
    Task<bool> UpdateAIFeatureUsageAsync(Guid accountId, AIFeatureType featureType);
}