// a button that adds the bot to the server

export default function AddBotToServer() {
  return (
    // popout window
    <a
      href="https://discord.com/api/oauth2/authorize?client_id=1094729151514161204&permissions=380139210752&scope=applications.commands%20bot"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button>Add Bot to Server</button>
    </a>
  );
}
