import { useCallback, useEffect, useMemo, useState } from "react"
import { days, parseDatas,  } from "./util";
import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
type PeriodStat= {
    thisPeriod: [dayjs.Dayjs, dayjs.Dayjs];
    lastPeriod: [dayjs.Dayjs, dayjs.Dayjs];
    thisPeriodNum: number;
    lastPeriodNum: number;
    rate: string | "-";
}

type KraStat = {
    sum: number,
    day: PeriodStat,
    week: PeriodStat,
    month: PeriodStat,
    year: PeriodStat,
    today: Dayjs,
    dayDatas: [Dayjs, number][],
}

function useHash(mockData: string = ''): string {
    const [hash, setHash] = useState<string>('');
    useEffect(() => {
        function onHashChange() {
            console.log('meme')
            if (mockData.length !== 0) {
                setHash(mockData)
                return
            }
            const search = window.location.hash
            if (search.length === 0 || search[0] != '#') {
                setHash('')
            } else {
                setHash(search.substring(1))
            }
        }
        window.addEventListener('hashchange', onHashChange)
        onHashChange()
        return () => {
            window.removeEventListener('hashchange', onHashChange)
        }
    }, [mockData])
    return hash
}

function getToday(): Dayjs {
    let now = dayjs()
    // let now = new Date()
    if (now.hour() < 6) {
        now = now.subtract(1, 'day')
    }
    return now.startOf('date')
}

function getRangeDays(startInclusive: Dayjs, endInclusive: Dayjs): Dayjs[] {
    const start = startInclusive.startOf('date')
    const end = endInclusive.startOf('date')
    const res: Dayjs[] = []
    for (let i = start; i.isBefore(end) || i.isSame(end); i = i.add(1, 'day')) {
        res.push(i)
    }
    return res
}

export function useStat(mockData: string = ''): KraStat {
    const hash = useHash(mockData)
    console.log(hash)
    const dateStrToNum = useMemo(() => parseDatas(hash), [hash])
    const getDayNum = useCallback((date: Dayjs) => dateStrToNum[date.format('YYYY-MM-DD')] ?? 0, [dateStrToNum])
    const getRangeSum = useCallback((start: Dayjs, end: Dayjs) => {
        return getRangeDays(start, end).reduce((acc, x) => acc + getDayNum(x), 0)
    }, [getDayNum])
    
    const today = getToday()
    const getPeriodDatas = useCallback((period: 'day' | 'week' | 'month' | 'year') => {
        const thisPeriod = [today.subtract(1, period).add(1, 'day'), today] as [Dayjs, Dayjs]
        const lastPeriod = thisPeriod.map(x=>x.subtract(1, period)) as [Dayjs, Dayjs]
        const thisPeriodNum = getRangeSum(...thisPeriod)
        const lastPeriodNum = getRangeSum(...lastPeriod)
        const rate = 
            lastPeriodNum === 0 ? 
                (thisPeriodNum === 0 ? (0).toFixed(2):  '-') : 
                ((thisPeriodNum - lastPeriodNum) / lastPeriodNum * 100).toFixed(2)
        return {
            thisPeriod, lastPeriod, thisPeriodNum, lastPeriodNum, rate
        }
    }, [today, getRangeSum])

    const sum = Object.values(dateStrToNum).reduce((acc, x) => acc + x, 0)

    const startDay = dayjs(_(Object.keys(dateStrToNum)).map(x => dayjs(x, 'YYYY-MM-DD')).minBy(d => d))
    const dayDatas = days(startDay, today).map(day => [day, getDayNum(day)] as [Dayjs, number])
    return {today, sum, dayDatas, day: getPeriodDatas('day'), month: getPeriodDatas('month'),  week: getPeriodDatas('week'), year: getPeriodDatas('year')} 
}