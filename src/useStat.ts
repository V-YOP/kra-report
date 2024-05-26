import { useCallback, useEffect, useMemo, useState } from "react"
import { days, parseDatas, } from "./util";
import _ from "lodash";
import dayjs, { Dayjs } from "dayjs";
import dayOfYear from 'dayjs/plugin/dayOfYear'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(customParseFormat)
dayjs.extend(dayOfYear)
dayjs.extend(weekOfYear)

type PeriodStat = {
  thisNatural: [dayjs.Dayjs, dayjs.Dayjs],
  lastNatural: [dayjs.Dayjs, dayjs.Dayjs],
  thisNaturalNum: number,
  lastNaturalNum: number,
  naturalRate: string | "-",

  thisReal: [dayjs.Dayjs, dayjs.Dayjs],
  lastReal: [dayjs.Dayjs, dayjs.Dayjs],
  thisRealNum: number,
  lastRealNum: number,
  realRate: string | "-",
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

export function useStat(mockData: string = ''): KraStat {
  const hash = useHash(mockData)
  const dateStrToNum = useMemo(() => parseDatas(hash), [hash])
  const getDayNum = useCallback((date: Dayjs) => dateStrToNum[date.format('YYYY-MM-DD')] ?? 0, [dateStrToNum])
  const getRangeSum = useCallback((start: Dayjs, end: Dayjs) => {
    return days(start, end).reduce((acc, x) => acc + getDayNum(x), 0)
  }, [getDayNum])

  const today = getToday()
  const getPeriodDatas = useCallback((period: 'day' | 'week' | 'month' | 'year') => {
    const thisReal = [today.subtract(1, period).add(1, 'day'), today] as [Dayjs, Dayjs]
    const lastReal = thisReal.map(x => x.subtract(1, period)) as [Dayjs, Dayjs]
    const thisRealNum = getRangeSum(...thisReal)
    const lastRealNum = getRangeSum(...lastReal)
    const realRate = getRate(thisRealNum, lastRealNum)

    let thisNatural: [Dayjs, Dayjs]
    if (period === 'day') {
      thisNatural = [...thisReal]
    } else if (period === 'week') {
      thisNatural = [today.day() === 0 ? today.subtract(1, 'week').add(1, 'day'): today.day(1), today]
    } else if (period === 'month') {
      thisNatural = [today.date(1), today]
    } else {
      thisNatural = [today.dayOfYear(1), today]
    }
    
    const lastNatural = [thisNatural[0].subtract(1, period), thisNatural[0].subtract(1, 'day')] as [Dayjs, Dayjs]
    let thisNaturalNum = getRangeSum(...thisNatural)
    let lastNaturalNum = getRangeSum(...lastNatural)
    const naturalRate = getRate(thisNaturalNum, lastNaturalNum)

    console.log(period, 'thisReal: ', thisReal.map(x=>x.format('YYYY-MM-DD')))
    console.log(period, 'lastReal: ', lastReal.map(x=>x.format('YYYY-MM-DD')))
    console.log(period, 'thisNatural: ', thisNatural.map(x=>x.format('YYYY-MM-DD')))
    console.log(period, 'lastNatural: ', lastNatural.map(x=>x.format('YYYY-MM-DD')))

    return {
      thisReal, lastReal, thisRealNum, lastRealNum, realRate, thisNatural, lastNatural, thisNaturalNum,
      lastNaturalNum, naturalRate
    }
  }, [today, getRangeSum])

  const sum = Object.values(dateStrToNum).reduce((acc, x) => acc + x, 0)
  const startDay = dayjs(_(Object.keys(dateStrToNum)).map(x => dayjs(x, 'YYYY-MM-DD')).minBy(d => d))
  const dayDatas = days(startDay, today).map(day => [day, getDayNum(day)] as [Dayjs, number])
  return { today, sum, dayDatas, day: getPeriodDatas('day'), month: getPeriodDatas('month'), week: getPeriodDatas('week'), year: getPeriodDatas('year') }
}

function getRate(thisPeriod: number, lastPeriod: number): string {
  return lastPeriod === 0 ?
    (thisPeriod === 0 ? (0).toFixed(2) : '-') :
    ((thisPeriod - lastPeriod) / lastPeriod * 100).toFixed(2)
}

function useHash(mockData: string = ''): string {
  const [hash, setHash] = useState<string>('');
  useEffect(() => {
    function onHashChange() {
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

// function days(startInclusive: Dayjs, endInclusive: Dayjs): Dayjs[] {
//   const start = startInclusive.startOf('date')
//   const end = endInclusive.startOf('date')
//   const res: Dayjs[] = []
//   for (let i = start; i.isBefore(end) || i.isSame(end); i = i.add(1, 'day')) {
//     res.push(i)
//   }
//   return res
// }
