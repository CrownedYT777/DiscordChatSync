package dev.ayanhalder.discordchatsync.listeners;

import dev.ayanhalder.discordchatsync.DiscordChatSync;
import dev.ayanhalder.discordchatsync.utils.MessageFormatter;
import net.dv8tion.jda.api.entities.channel.ChannelType;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.kyori.adventure.text.Component;
import org.jetbrains.annotations.NotNull;

public class DiscordChatListener extends ListenerAdapter {
    private final DiscordChatSync plugin;

    public DiscordChatListener(DiscordChatSync plugin) {
        this.plugin = plugin;
    }

    @Override
    public void onMessageReceived(@NotNull MessageReceivedEvent event) {
        // Ignore if message is from a bot or not from a text channel
        if (event.getAuthor().isBot() || !event.isFromType(ChannelType.TEXT)) {
            return;
        }

        // Check if message is from the configured channel
        if (!event.getChannel().getId().equals(plugin.getDiscordManager().getChannel().getId())) {
            return;
        }

        String username = event.getMember() != null ? event.getMember().getEffectiveName() : event.getAuthor().getName();
        String message = event.getMessage().getContentDisplay();

        // Format and broadcast message to Minecraft
        String formattedMessage = MessageFormatter.formatDiscordToMinecraft(username, message);
        plugin.getServer().broadcast(Component.text(formattedMessage));
    }
}
