import { Injectable } from '@angular/core';

@Injectable()
export class SubtitlesParser {
    constructor() { }

    private ass(text: string) {
        const reAss = new RegExp(
            'Dialogue:\\s\\d,' +                 // get time and subtitle
            '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +     // start time
            '(\\d+:\\d\\d:\\d\\d.\\d\\d),' +     // end time
            '([^,]*),' +                         // object
            '([^,]*),' +                         // actor
            '(?:[^,]*,){4}' +
            '(.*)$',                             // subtitle
            'i'
        );
        const reTime = /(\d+):(\d\d):(\d\d).(\d\d)/;
        const reStyle = /\{[^}]+\}/g;

        const getSeconds = (timeStr: string) => {
            const match = timeStr.match(reTime);
            return Math.round(
                parseInt(match[1], 10) * 60 * 60 * 1000 +
                parseInt(match[2], 10) * 60 * 1000 +
                parseInt(match[3], 10) * 1000 +
                parseInt(match[4], 10) * 10
            ) / 1000;
        };

        const lines = text.split(/[\n\r]+/g);
        const captions = lines.map((line, index) => {
            const match = line.match(reAss);
            if (!match) { return null; }
            return {
                id: index + 1,
                startTime: getSeconds(match[1]),
                endTime: getSeconds(match[2]),
                text: match[5].replace(reStyle, '').replace(/\\N/g, '\n'),
                voice: match[3] && match[4] ? match[3] + ' ' + match[4] : ''
            };
        }).filter((caption) => {
            return caption != null;
        });

        return captions.length ? captions : null;
    }

    private srt(text: string) {
        const reTime = /(\d\d):(\d\d):(\d\d),(\d\d\d)/;

        if (!reTime.test(text)) {
            return null;
        }

        const getSeconds = (timeStr: string) => {
            const match = timeStr.match(reTime);
            return Math.round(
                parseInt(match[1], 10) * 60 * 60 * 1000 +
                parseInt(match[2], 10) * 60 * 1000 +
                parseInt(match[3], 10) * 1000 +
                parseInt(match[4], 10)
            ) / 1000;
        };

        const entries = text.split(/\n[\r\n]+/g);
        const captions = entries.map((entry) => {
            const lines = entry.split(/\n+/g);
            if (lines.length < 3) { return null; }
            const timestamps = lines[1].split(/\s*-->\s*/);
            return {
                id: lines[0],
                startTime: getSeconds(timestamps[0]),
                endTime: getSeconds(timestamps[1]),
                text: lines.slice(2).join('\n')
            };
        }).filter(caption => {
            return caption != null;
        });

        return captions.length ? captions : null;
    }

    private formatVtt(captions: any[]) {
        const padWithZeros = (num: string | number, digits: number) => ('0000' + num).slice(-digits);

        const formatTime = (seconds: number) => {
            const date = new Date(2000, 0, 1, 0, 0, 0, seconds * 1000);
            return [
                padWithZeros(date.getHours(), 2),
                padWithZeros(date.getMinutes(), 2),
                padWithZeros(date.getSeconds(), 2) + '.' + padWithZeros(date.getMilliseconds(), 3)
            ].join(':');
        };

        const lines = captions.map(caption => {
            return [
                caption.id,
                formatTime(caption.startTime) + ' --> ' + formatTime(caption.endTime),
                (caption.voice ? '<v ' + caption.voice + '>' : '') + caption.text
            ].join('\n');
        });

        return 'WEBVTT\n\n' + lines.join('\n\n');
    }

    toVTT(text: string) {
        if (text.indexOf('WEBVTT') === 0) {
            return text;
        }

        const parsed = this.ass(text) || this.srt(text);
        if (parsed) {
            return this.formatVtt(parsed);
        }

        return text;
    }
}
