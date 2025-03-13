
package dev.ayanhalder.discordchatsync.config;

import dev.ayanhalder.discordchatsync.DiscordChatSync;
import org.bukkit.configuration.file.FileConfiguration;

public class ConfigManager {
    private final DiscordChatSync plugin;
    private FileConfiguration config;

    public ConfigManager(DiscordChatSync plugin) {
        this.plugin = plugin;
        loadConfig();
    }

    public void loadConfig() {
        // Save default config if it doesn't exist
        plugin.saveDefaultConfig();
        plugin.reloadConfig();
        config = plugin.getConfig();
    }

    public String getDiscordToken() {
        return config.getString("discord.token");
    }

    public String getDiscordChannelId() {
        return config.getString("discord.channel-id");
    }

    public boolean isMessageTypeEnabled(String type) {
        return config.getBoolean("messages." + type + ".enabled", true);
    }

    public String getMessageFormat(String path, String defaultValue) {
        return config.getString("messages." + path + ".format", defaultValue);
    }
    
    public boolean isDebugEnabled() {
        return config.getBoolean("debug", false);
    }
    
    public FileConfiguration getConfig() {
        return config;
    }
}
