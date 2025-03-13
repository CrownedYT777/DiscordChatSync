package dev.ayanhalder.discordchatsync.utils;

import dev.ayanhalder.discordchatsync.DiscordChatSync;

public class MessageFormatter {
    public static String formatMinecraftToDiscord(DiscordChatSync plugin, String username, String message) {
        String format = plugin.getConfig().getString("formats.minecraft_to_discord", "**%player%**: %message%");
        return format.replace("%player%", username)
                    .replace("%message%", message);
    }

    public static String formatDiscordToMinecraft(String username, String message) {
        return "§9Discord §8» §7" + username + "§8: §f" + message;
    }
}
