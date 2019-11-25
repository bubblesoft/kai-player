<template lang="pug">
    div.yoyo-marquee
        span.content(
            ref="content"
            :class="{ animated: contentWidth > width }"
            :style="{ animationDuration: (contentWidth - width) / 10 + 's' }"
        )
            slot
</template>

<script>
    let mutationObserver;

    export default {
        data() {
          return {
              width: 0,
              contentWidth: 0
          }
        },

        methods: {
            updateWidth() {
                const contentDomElement = this.$refs.content;

                this.width = this.$el.offsetWidth;

                const isWeiXin = /micromessenger/.test(window.navigator.userAgent.toLowerCase());

                if (isWeiXin) {
                    this.width += 5;
                }

                contentDomElement.style.setProperty("--parent-width", this.width + 'px');
                this.contentWidth = this.$refs.content.offsetWidth;
                contentDomElement.style.setProperty("--width", this.contentWidth + 'px');
            }
        },

        mounted() {
            this.$nextTick(this.updateWidth);
            mutationObserver = new MutationObserver(this.updateWidth);
            mutationObserver.observe(this.$el, { attributes: true });

            mutationObserver.observe(this.$refs.content, {
                childList: true,
                subtree: true
            });

            window.addEventListener('resize', this.updateWidth);
        },

        destroyed() {
            mutationObserver.disconnect();
            window.removeEventListener('resize', this.updateWidth);
        },
    }
</script>

<style lang="scss" scoped>
    .yoyo-marquee {
        overflow: hidden;
        text-align: left;

        .content {
            display: inline-block;
            white-space: nowrap;
        }

        .animated {
            animation: marquee linear infinite alternate;
        }

        @keyframes marquee {
            0% {
                transform: translateX(0);
            }

            40% {
                transform: translateX(0);
            }

            70% {
                transform: translateX(-50%);
                transform: translateX(calc(var(--parent-width) - var(--width)));
            }

            100% {
                transform: translateX(-50%);
                transform: translateX(calc(var(--parent-width) - var(--width)));
            }
        }
    }
</style>
