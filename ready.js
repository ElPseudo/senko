module.exports = async(bot) => {

    bot.user.setPresence({
        game: {
            name: "!help"
        }
    })
};