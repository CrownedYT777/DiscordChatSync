package dev.ayanhalder.discordchatsync;

import dev.ayanhalder.discordchatsync.config.ConfigManager;
import dev.ayanhalder.discordchatsync.discord.DiscordManager;
import dev.ayanhalder.discordchatsync.listeners.MinecraftChatListener;
import dev.ayanhalder.discordchatsync.listeners.PlayerEventListener;
import org.bukkit.plugin.java.JavaPlugin;
import java.util.logging.Level;

public class DiscordChatSync extends JavaPlugin {
    private static DiscordChatSync instance;
    private ConfigManager configManager;
    private DiscordManager discordManager;

    @Override
    public void onEnable() {
        instance = this;
        getLogger().info("Starting DiscordChatSync plugin initialization...");

        // Initialize configuration
        getLogger().info("Loading configuration...");
        configManager = new ConfigManager(this);

        // Debug log the configuration status
        logDebug("Configuration Status:");
        logDebug("- Config File Present: " + (configManager.getConfig() != null));
        logDebug("- Token Setting: " + (configManager.getDiscordToken() != null ? "configured" : "not found"));
        logDebug("- Channel ID Setting: " + (configManager.getDiscordChannelId() != null ? "configured" : "not found"));

        // Initialize Discord connection
        getLogger().info("Initializing Discord connection...");
        discordManager = new DiscordManager(this);
        if (!discordManager.initialize()) {
            getLogger().severe("Failed to initialize Discord connection. Plugin will be disabled.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        // Register event listeners
        getLogger().info("Registering event listeners...");
        getServer().getPluginManager().registerEvents(new MinecraftChatListener(this), this);
        getServer().getPluginManager().registerEvents(new PlayerEventListener(this), this);

        // Send server start message if enabled
        if (configManager.isMessageTypeEnabled("server")) {
            String startMessage = configManager.getMessageFormat("server.start", "Server has started");
            discordManager.sendMessage(startMessage);
        }

        getLogger().info("DiscordChatSync has been enabled successfully!");
    }

    @Override
    public void onDisable() {
        // Send server stop message if enabled
        if (discordManager != null && configManager.isMessageTypeEnabled("server")) {
            String stopMessage = configManager.getMessageFormat("server.stop", "Server has stopped");
            discordManager.sendMessage(stopMessage);
        }

        // Shutdown Discord connection
        if (discordManager != null) {
            discordManager.shutdown();
        }

        getLogger().info("DiscordChatSync has been disabled.");
    }

    public static DiscordChatSync getInstance() {
        return instance;
    }

    public ConfigManager getConfigManager() {
        return configManager;
    }

    public DiscordManager getDiscordManager() {
        return discordManager;
    }

    public void logDebug(String message) {
        if (configManager != null && configManager.isDebugEnabled()) {
            getLogger().log(Level.INFO, "[Debug] " + message);
        }
    }
}
