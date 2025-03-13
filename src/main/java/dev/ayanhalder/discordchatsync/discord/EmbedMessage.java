
package dev.ayanhalder.discordchatsync.discord;

public class EmbedMessage {
    public String avatar;
    public String username;
    public String message;

    public EmbedMessage(String avatar, String username, String message) {
        this.avatar = avatar;
        this.username = username;
        this.message = message;
    }
}
