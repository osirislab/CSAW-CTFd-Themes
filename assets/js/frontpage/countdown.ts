import { CountUp, CountUpOptions } from 'countup.js';
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import CTFd from "../index"

dayjs.extend(duration);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function calcTime(time: Dayjs) {
    const curr = dayjs()
    return dayjs.duration(time.diff(curr));
}

function createCounts(diff: duration.Duration, config?: CountUpOptions) {
    return {
        dayCount: new CountUp('days-count', diff.days(), config),
        hourCount: new CountUp('hours-count', diff.hours(), config),
        minCount: new CountUp('mins-count', diff.minutes(), config),
        secCount: new CountUp('secs-count', diff.seconds(), config),
    }
}

window.onload = async function () {
    const start = dayjs.unix(CTFd.config.start);
    const end = dayjs.unix(CTFd.config.end);

    // Check if CTF has ended
    if (dayjs().isAfter(end)) {
        const el = document.getElementById("countdown");
        el!.innerHTML = "CSAW has ended - Thanks for playing!"
        return;
    }

    // Check if CTF has started, and if so countdown to end time.
    const isStarted = dayjs().isAfter(start);

    let time = start;
    if (isStarted) {
        time = end;
        document.getElementById("count-text")!.textContent = "CTF Ends In:"
    }

    const counts = createCounts(calcTime(time));
    let count: keyof typeof counts;
    for (count in counts) {
        counts[count].start();
    }

    await sleep(2000);

    update(time, counts);
}

async function update(time: Dayjs, counts: ReturnType<typeof createCounts>) {
    const dur = calcTime(time);
    counts.dayCount.update(dur.days());
    counts.hourCount.update(dur.hours());
    counts.minCount.update(dur.minutes());
    counts.secCount.update(dur.seconds());

    setTimeout(update, 1000, time, counts);
}