                    (function() {
                        if (window.TweenLite) {
                            var counter = document.querySelector('.kai-loading__counter');

                            TweenLite.to({
                                progress: 20
                            }, 0.5, {
                                progress: 100,
                                onUpdate: function() {
                                    counter.querySelector('h1').childNodes[0].data = this.target.progress.toFixed() + "%";
                                    counter.querySelector('hr').style.width = this.target.progress.toFixed() + "%";
                                },
                                onComplete: function() {
                                    TweenLite.to({
                                        opacity: 1
                                    }, 0.5, {
                                        opacity: 0,
                                        onUpdate: function() {
                                            document.querySelector('.kai-loading').style.opacity = '' + this.target.opacity;
                                        },
                                        onComplete: function() {
                                            document.querySelector('.kai-loading').style.display = 'none';
                                        }
                                    });
                                }
                            });
                        } else {
                            document.querySelector('.kai-loading').style.display = 'none';
                        }
                    }());