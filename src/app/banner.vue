<template lang="pug">
    .banner
        a.icon(
            href="https://soundcloud.com/"
            target="_blank"
        )
            img(
                src="../assets/soundcloud.ico"
                data-src="https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14b.ico"
                alt="SoundCloud"
                title="SoundCloud"
            )
        a.icon(
            href="https://hearthis.at/"
            target="_blank"
        )
            img(
                src="../assets/hearthisat.ico"
                data-src="https://hearthis.at/favicon.ico"
                alt="hearthis.at"
                title="hearthis.at"
            )
        a.icon(
            href="http://music.163.com"
            target="_blank"
        )
            img(
                src="http://s1.music.126.net/style/favicon.ico"
                alt="网易云音乐"
                title="网易云音乐"
            )
        a.icon(
            href="https://y.qq.com/"
            target="_blank"
        )
            img(
                src="https://y.qq.com/favicon.ico"
                alt="QQ音乐"
                title="QQ音乐"
            )
        a.icon(
            href="http://music.baidu.com/"
            target="_blank"
        )
            img(
                src="http://music.baidu.com/static/images/favicon.ico"
                alt="百度音乐"
                title="百度音乐"
            )
        .links
            a.link(
                href="/"
                target="_blank"
            ) HOME
            span &nbsp;&nbsp;
            span |
            span &nbsp;&nbsp;
            a.link(
                href="https://github.com/bubblesoft/kai-player"
                target="_blank"
            ) GITHUB
</template>

<script>
</script>

<style lang="scss" scoped>
    .banner {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 20px;

        @media (max-width: 768px) {
            padding: 16px;
        }

        .icon {
            margin: 0 10px;

            @media (max-width: 768px) {
                margin: 0 8px;
            }

            img {
                width: 32px;
                height: 32px;
                
                @media (max-width: 768px) {
                    width: 28px;
                    height: 28px;
                }
            }

            @media (max-width: 372px) {
                display: none;
            }
        }

        .links {
            margin-left: 20px;

            @media (max-width: 768px) {
                margin-left: 15px;
            }

            .link {
                margin: 0;
                color: #fff;
                text-shadow: 0 0 20px #969696;
            }
        }
    }
</style>