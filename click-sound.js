(function () {
    'use strict';

    var interactiveSelector = [
        'a[href]',
        'button',
        '[role="button"]',
        'input[type="button"]',
        'input[type="submit"]',
        '.btn',
        '.governor-card',
        '.lb-prev',
        '.lb-next',
        '.lb-close'
    ].join(', ');

    var audioContext = null;
    var lastClickAt = 0;

    function getAudioContext() {
        if (audioContext) {
            return audioContext;
        }

        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
            return null;
        }

        audioContext = new Ctx();
        return audioContext;
    }

    function playClickSound() {
        var context = getAudioContext();
        if (!context) {
            return;
        }

        if (context.state === 'suspended') {
            context.resume();
        }

        var now = context.currentTime;
        var oscillator = context.createOscillator();
        var gainNode = context.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1400, now);
        oscillator.frequency.exponentialRampToValueAtTime(820, now + 0.045);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.055);
    }

    document.addEventListener('click', function (event) {
        var target = event.target && event.target.closest
            ? event.target.closest(interactiveSelector)
            : null;

        if (!target || target.hasAttribute('data-no-click-sound')) {
            return;
        }

        if (event.defaultPrevented) {
            return;
        }

        var nowMs = Date.now();
        if (nowMs - lastClickAt < 70) {
            return;
        }

        lastClickAt = nowMs;
        playClickSound();
    }, true);
}());
