const fs = require('fs');
const path = require('path');

const tabs = {
  'GeneralTabs': ['PlatformPreferencesTab', 'DashboardPreferencesTab', 'TradingPreferencesTab', 'DeviceSyncTab', 'QuickActionsTab', 'ActivitySummaryTab'],
  'SecurityTabs': ['AccountInfoTab', 'PasswordAuthTab', 'LoginSessionsTab', 'SecurityMonitoringTab', 'PrivacyControlsTab', 'BrokerSecurityTab', 'AccountRecoveryTab', 'DataControlsTab', 'AuditLogsTab'],
  'AppearanceTabs': ['ThemeModeTab', 'AccentColorsTab', 'TypographyTab', 'LayoutInterfaceTab', 'DashboardAppearanceTab', 'ChartAppearanceTab', 'EffectsAnimationsTab', 'MobileUITab', 'AccessibilityTab', 'CustomPresetsTab', 'LivePreviewTab'],
  'LanguageTabs': ['LanguagePreferencesTab', 'RegionLocalizationTab', 'TranslationSettingsTab', 'RegionalTradingTab'],
  'NotificationTabs': ['PushNotificationsTab', 'EmailNotificationsTab', 'SmsWhatsappTab', 'CommunityAlertsTab', 'AiNotificationsTab', 'CompetitionAlertsTab', 'NotificationControlsTab'],
  'AiTabs': ['AiMentorControlsTab', 'TradingAssistanceTab', 'AiJournalTab', 'AiAutomationTab', 'AiPersonalizationTab'],
  'IntegrationTabs': ['ConnectedBrokersTab', 'ApiManagementTab', 'TradingIntegrationsTab', 'SyncDataTab', 'SecurityControlsTab'],
  'BillingTabs': ['CurrentPlanTab', 'PaymentMethodsTab', 'BillingHistoryTab', 'FeatureAccessTab'],
  'CommunityTabs': ['ChannelControlsTab', 'ChatModerationTab', 'CreatorProfileTab', 'MonetizationTab', 'AnalyticsTab'],
  'SupportTabs': ['HelpCenterTab', 'ContactSupportTab', 'ReportBugTab', 'LegalPoliciesTab']
};

const baseDir = path.join('src', 'components', 'settings');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

for (const [folder, files] of Object.entries(tabs)) {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  for (const file of files) {
    const filePath = path.join(folderPath, file + '.tsx');
    if (!fs.existsSync(filePath)) {
      const content = `import React from 'react';

export default function ${file}() {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">${file.replace(/([A-Z])/g, ' $1').trim()}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        Settings and configurations for ${file.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} will appear here.
      </p>
    </div>
  );
}
`;
      fs.writeFileSync(filePath, content);
    }
  }
}
console.log('Done generating tabs');
