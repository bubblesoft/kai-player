<template lang="pug">
    .yoyo-marquee
        .content(
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

        mounted() {
            const contentDomElement = this.$refs.content;

            this.$nextTick(() => {
                this.width = this.$el.offsetWidth;
                contentDomElement.style.setProperty("--parent-width", this.width + 'px');
            });

            mutationObserver = new MutationObserver(() => {
                this.contentWidth = this.$refs.content.offsetWidth;
                contentDomElement.style.setProperty("--width", this.contentWidth + 'px');
            });

            mutationObserver.observe(this.$el, { attributes: true });

            mutationObserver.observe(contentDomElement, {
                childList: true,
                subtree: true
            });
        },

        destroyed() {
            mutationObserver.disconnect();
        }
    }
</script>

<style lang="scss" scoped>
    .yoyo-marquee {
        overflow: hidden;
        text-align: center;

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