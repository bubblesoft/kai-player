//
                    (function() {
                        if (window.TweenLite) {
                            var counter = document.querySelector('.kai-loading__counter');

                            TweenLite.to({
                                progress: 10
                            }, 0.5, {
                                progress: 20,
                                onUpdate: function() {
                                    counter.querySelector('h1').childNodes[0].data = this.target.progress.toFixed() + "%";
                                    counter.querySelector('hr').style.width = this.target.progress.toFixed() + "%";
                                }
                            });
                        }
                    }());
                !function(e){function r(r){for(var n,o,a=r[0],c=r[1],l=r[2],p=0,f=[];p<a.length;p++)o=a[p],u[o]&&f.push(u[o][0]),u[o]=0;for(n in c)Object.prototype.hasOwnProperty.call(c,n)&&(e[n]=c[n]);for(s&&s(r);f.length;)f.shift()();return i.push.apply(i,l||[]),t()}function t(){for(var e,r=0;r<i.length;r++){for(var t=i[r],o=!0,a=1;a<t.length;a++){var c=t[a];0!==u[c]&&(o=!1)}o&&(i.splice(r--,1),e=n(n.s=t[0]))}return e}function n(r){if(o[r])return o[r].exports;var t=o[r]={i:r,l:!1,exports:{}};return e[r].call(t.exports,t,t.exports,n),t.l=!0,t.exports}var o={},u={9:0},i=[];n.e=function(e){var r=[],t=u[e];if(0!==t)if(t)r.push(t[2]);else{var o=new Promise(function(r,n){t=u[e]=[r,n]});r.push(t[2]=o);var i=document.getElementsByTagName("head")[0],a=document.createElement("script");a.charset="utf-8",a.timeout=120,n.nc&&a.setAttribute("nonce",n.nc),a.src=function(e){return n.p+""+({}[e]||e)+".bundle.js"}(e);var c=setTimeout(function(){l({type:"timeout",target:a})},12e4);function l(r){a.onerror=a.onload=null,clearTimeout(c);var t=u[e];if(0!==t){if(t){var n=r&&("load"===r.type?"missing":r.type),o=r&&r.target&&r.target.src,i=new Error("Loading chunk "+e+" failed.\n("+n+": "+o+")");i.type=n,i.request=o,t[1](i)}u[e]=void 0}}a.onerror=a.onload=l,i.appendChild(a)}return Promise.all(r)},n.m=e,n.c=o,n.d=function(e,r,t){n.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:t})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(r,"a",r),r},n.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},n.p="",n.oe=function(e){throw console.error(e),e};var a=window.webpackJsonp=window.webpackJsonp||[],c=a.push.bind(a);a.push=r,a=a.slice();for(var l=0;l<a.length;l++)r(a[l]);var s=c;t()}([]);