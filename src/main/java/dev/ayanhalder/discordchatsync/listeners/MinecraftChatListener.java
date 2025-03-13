package dev.ayanhalder.discordchatsync.listeners;

import dev.ayanhalder.discordchatsync.DiscordChatSync;
import dev.ayanhalder.discordchatsync.utils.MessageFormatter;
import io.papermc.paper.event.player.AsyncChatEvent;
import net.kyori.adventure.text.TextComponent;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;

public class MinecraftChatListener implements Listener {
    private final DiscordChatSync plugin;

    public MinecraftChatListener(DiscordChatSync plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onAsyncPlayerChat(AsyncChatEvent event) {
        if (event.message() instanceof TextComponent textComponent) {
            String message = textComponent.content();
            String username = event.getPlayer().getName();

            // Format the message according to config
            String formattedMessage = MessageFormatter.formatMinecraftToDiscord(plugin, username, message);

            // Send to Discord
            plugin.getDiscordManager().sendMessage(formattedMessage);
        }
    }
}
