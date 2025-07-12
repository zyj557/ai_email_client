using Microsoft.Extensions.DependencyInjection;
using Wino.Core.Domain.Interfaces;
using Wino.Services.Threading;
using System.Net.Http;

namespace Wino.Services;

public static class ServicesContainerSetup
{
    public static void RegisterSharedServices(this IServiceCollection services)
    {
        services.AddSingleton<ITranslationService, TranslationService>();
        services.AddSingleton<IDatabaseService, DatabaseService>();

        services.AddSingleton<IApplicationConfiguration, ApplicationConfiguration>();
        services.AddSingleton<IWinoLogger, WinoLogger>();
        services.AddSingleton<ILaunchProtocolService, LaunchProtocolService>();
        services.AddSingleton<IMimeFileService, MimeFileService>();

        services.AddTransient<ICalendarService, CalendarService>();
        services.AddTransient<IMailService, MailService>();
        services.AddTransient<IFolderService, FolderService>();
        services.AddTransient<IAccountService, AccountService>();
        services.AddTransient<IContactService, ContactService>();
        services.AddTransient<ISignatureService, SignatureService>();
        services.AddTransient<IContextMenuItemService, ContextMenuItemService>();
        services.AddTransient<ISpecialImapProviderConfigResolver, SpecialImapProviderConfigResolver>();

        services.AddSingleton<IThreadingStrategyProvider, ThreadingStrategyProvider>();
        services.AddTransient<IOutlookThreadingStrategy, OutlookThreadingStrategy>();
        services.AddTransient<IGmailThreadingStrategy, GmailThreadingStrategy>();
        services.AddTransient<IImapThreadingStrategy, ImapThreadingStrategy>();

        // Register HTTP client for AI services
        services.AddHttpClient();
        
        // Register AI services
        services.AddSingleton<IAIService, DeepSeekAIService>();
        services.AddTransient<IMailAIAnalysisService, MailAIAnalysisService>();
        services.AddTransient<IAIMailTranslationService, AIMailTranslationService>();
        services.AddTransient<IAIMailAssistantService, AIMailAssistantService>();
        services.AddTransient<IAIMailSettingsService, AIMailSettingsService>();
        services.AddTransient<IAIMailWorkflowService, AIMailWorkflowService>();

    }
}
