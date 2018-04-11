<template lang="pug">
    .banner
        a(
            href="https://soundcloud.com/"
            target="_blank"
        )
            img(
                src="https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14b.ico"
                alt="SoundCloud"
                title="SoundCloud"
            )
        a(
            href="https://hearthis.at/"
            target="_blank"
        )
            img(
                src="https://hearthis.at/favicon.ico"
                alt="hearthis.at"
                title="hearthis.at"
            )
        a(
            href="http://music.163.com"
            target="_blank"
        )
            img(
                src="http://s1.music.126.net/style/favicon.ico"
                alt="网易云音乐"
                title="网易云音乐"
            )
        a(
            href="https://y.qq.com/"
            target="_blank"
        )
            img(
                src="https://y.qq.com/favicon.ico"
                alt="QQ音乐"
                title="QQ音乐"
            )
        a(
            href="http://music.baidu.com/"
            target="_blank"
        )
            img(
                src="http://music.baidu.com/favicon.ico"
                alt="百度音乐"
                title="百度音乐"
            )
</template>

<script>
</script>

<style lang="scss" scoped>
    .banner {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 20px;

        a {
            margin: 0 10px;
        }
    }
</style>