package dev.ayanhalder.discordchatsync.discord;

import dev.ayanhalder.discordchatsync.DiscordChatSync;
import dev.ayanhalder.discordchatsync.listeners.DiscordChatListener;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.requests.GatewayIntent;
import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.MessageEmbed;
import java.awt.Color;

// Using the separate EmbedMessage class instead of defining it here

public class DiscordManager {
    private final DiscordChatSync plugin;
    private JDA jda;
    private TextChannel channel;

    public DiscordManager(DiscordChatSync plugin) {
        this.plugin = plugin;
    }

    public boolean initialize() {
        try {
            String token = plugin.getConfigManager().getDiscordToken();
            String channelId = plugin.getConfigManager().getDiscordChannelId();

            if (token == null || token.isEmpty()) {
                plugin.getLogger().severe("Discord bot token is not configured!");
                return false;
            }

            if (channelId == null || channelId.isEmpty()) {
                plugin.getLogger().severe("Discord channel ID is not configured!");
                return false;
            }

            // Create JDA instance with necessary intents
            jda = JDABuilder.createDefault(token)
                    .enableIntents(GatewayIntent.MESSAGE_CONTENT)
                    .build();

            try {
                // Wait for JDA to be ready
                jda.awaitReady();

                // Get the configured text channel
                channel = jda.getTextChannelById(channelId);

                if (channel == null) {
                    plugin.getLogger().severe("Could not find Discord channel with ID: " + channelId);
                    return false;
                }

                // Register Discord event listener
                jda.addEventListener(new DiscordChatListener(plugin));

                plugin.getLogger().info("Successfully connected to Discord!");
                return true;
            } catch (InterruptedException e) {
                plugin.getLogger().severe("Interrupted while waiting for JDA to initialize: " + e.getMessage());
                Thread.currentThread().interrupt();
                return false;
            }
        } catch (Exception e) {
            plugin.getLogger().severe("Failed to initialize Discord connection: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public void sendMessage(String message) {
        if (channel == null || !jda.getStatus().equals(JDA.Status.CONNECTED)) {
            plugin.logDebug("Cannot send message: Discord not connected or channel not found");
            return;
        }

        try {
            channel.sendMessage(message).queue();
            plugin.logDebug("Sent message to Discord: " + message);
        } catch (Exception e) {
            plugin.getLogger().warning("Failed to send message to Discord: " + e.getMessage());
        }
    }

    public void sendEmbed(MessageEmbed embed) {
        if (channel == null || !jda.getStatus().equals(JDA.Status.CONNECTED)) {
            plugin.logDebug("Cannot send embed: Discord not connected or channel not found");
            return;
        }

        try {
            channel.sendMessageEmbeds(embed).queue();
            plugin.logDebug("Sent embed to Discord");
        } catch (Exception e) {
            plugin.getLogger().warning("Failed to send embed to Discord: " + e.getMessage());
        }
    }


    public void sendEventMessage(EmbedMessage embedMessage) {
        Color color = null;
        if (embedMessage.message.contains("joined")) {
            color = Color.GREEN;
        } else if (embedMessage.message.contains("left")) {
            color = Color.RED;
        } else if (embedMessage.message.contains("advanced")) {
            color = Color.YELLOW;
        } else {
            color = Color.decode("#8865db"); // Default color if no keyword found
        }

        sendEmbed(new EmbedBuilder()
                .setColor(color)
                .setAuthor(embedMessage.username, null, embedMessage.avatar)
                .setDescription(embedMessage.message)
                .build());
    }



    public void sendChatMessage(String username, String message, String avatarUrl) {
        if (channel != null) {
            plugin.logDebug("Sending chat message: " + username + ": " + message);

            EmbedBuilder embed = new EmbedBuilder()
                    .setColor(new Color(88, 101, 242))
                    .setDescription(message);

            if (avatarUrl != null) {
                embed.setAuthor(username, null, avatarUrl);
            } else {
                embed.setAuthor(username);
            }

            channel.sendMessageEmbeds(embed.build()).queue();
        }
    }

    public void shutdown() {
        if (jda != null) {
            jda.shutdown();
        }
    }

    public TextChannel getChannel() {
        return channel;
    }
            }
