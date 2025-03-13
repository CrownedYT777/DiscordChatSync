
package dev.ayanhalder.discordchatsync.listeners;

import dev.ayanhalder.discordchatsync.DiscordChatSync;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerAdvancementDoneEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import net.dv8tion.jda.api.EmbedBuilder;
import org.bukkit.advancement.Advancement;
import java.awt.Color;

public class PlayerEventListener implements Listener {
    private final DiscordChatSync plugin;

    public PlayerEventListener(DiscordChatSync plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerJoin(PlayerJoinEvent event) {
        if (!plugin.getConfigManager().isMessageTypeEnabled("join")) {
            return;
        }

        String username = event.getPlayer().getName();
        String message = username + " joined the server";

        // Create embed with green sidebar for join messages
        EmbedBuilder embed = new EmbedBuilder();
        embed.setColor(new Color(0, 255, 0)); // Green
        embed.setDescription(message);
        embed.setThumbnail("https://minotar.net/avatar/" + username + "/32");
        
        plugin.getDiscordManager().sendEmbed(embed.build());
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerQuit(PlayerQuitEvent event) {
        if (!plugin.getConfigManager().isMessageTypeEnabled("quit")) {
            return;
        }

        String username = event.getPlayer().getName();
        String message = username + " left the server";

        // Create embed with red sidebar for leave messages
        EmbedBuilder embed = new EmbedBuilder();
        embed.setColor(new Color(255, 0, 0)); // Red
        embed.setDescription(message);
        embed.setThumbnail("https://minotar.net/avatar/" + username + "/32");
        
        plugin.getDiscordManager().sendEmbed(embed.build());
    }
    
    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerAdvancement(PlayerAdvancementDoneEvent event) {
        if (!plugin.getConfigManager().isMessageTypeEnabled("advancement")) {
            return;
        }
        
        Advancement advancement = event.getAdvancement();
        String advancementKey = advancement.getKey().getKey();
        
        // Skip recipe advancements
        if (advancementKey.startsWith("recipes/")) {
            return;
        }
        
        // Get the advancement name
        String advancementName = getAdvancementName(advancementKey);
        if (advancementName == null) {
            return;
        }
        
        String username = event.getPlayer().getName();
        String message = username + " has made the advancement\n" + advancementName;
        
        // Create embed with yellow sidebar for advancements
        EmbedBuilder embed = new EmbedBuilder();
        embed.setColor(new Color(255, 215, 0)); // Yellow/Gold
        embed.setDescription(message);
        embed.setThumbnail("https://minotar.net/avatar/" + username + "/32");
        
        plugin.getDiscordManager().sendEmbed(embed.build());
    }
    
    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerDeath(PlayerDeathEvent event) {
        if (!plugin.getConfigManager().isMessageTypeEnabled("death")) {
            return;
        }
        
        String deathMessage = event.getDeathMessage();
        if (deathMessage == null) {
            return;
        }
        
        // Create embed for death messages
        EmbedBuilder embed = new EmbedBuilder();
        embed.setColor(new Color(139, 0, 0)); // Dark Red
        embed.setDescription(deathMessage);
        
        plugin.getDiscordManager().sendEmbed(embed.build());
    }
    
    // Helper method to convert advancement keys to readable names
    private String getAdvancementName(String key) {
        // Convert advancement key to readable name
        // Examples: "story/mine_stone" -> "Stone Age"
        if (key.equals("story/mine_stone")) {
            return "Stone Age!";
        }
        
        // Add more advancement mappings as needed
        
        return key.substring(key.lastIndexOf('/') + 1)
                .replace('_', ' ')
                .trim();
    }
}
