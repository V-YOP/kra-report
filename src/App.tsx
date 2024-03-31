import { Box, Button, Container, HStack, Progress, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber, Text, VStack, useColorMode, useTheme } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Heatmap from './Heatmap'
import { useStat } from './useStat'
import { EChartsOption } from 'echarts'
import { useEcharts } from './useEcharts'
import { Dayjs } from 'dayjs'
import _ from 'lodash'


function minuteToHour(minute: number): string {
    return (minute / 60).toFixed(1)
}

function App() {
  const stat = useStat()
  const { colorMode, toggleColorMode } = useColorMode()
  const fourteenDaysEChartOption = useMemo(() => fourteenDaysLineChart(stat.today, stat.dayDatas), [stat])
  const {id: fourteenDaysEChartId} = useEcharts(fourteenDaysEChartOption, colorMode)

  const rateText = useCallback((rate: string) => {
    if (rate === '-') {
      return <><StatArrow type='increase' /> - %</>
    }
    if (rate[0] === '-') {
      return <><StatArrow type='decrease' /> {rate.substring(1)} %</>
    }
    return <><StatArrow type={rate === '0.00' ? 'decrease' : 'increase'} /> {rate} %</>
  }, [])

  const [range, setRange] = useState(7)

  return (
    <Container maxW='64em'>
      <Button onClick={toggleColorMode}>toggle</Button>
      <VStack alignItems={'stretch'} spacing={8}>
        <HStack  mt={8} >
          <Stat flexBasis={'8em'} flexGrow={0}>
            <StatLabel>本日（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.day.thisPeriodNum)} / 3</StatNumber>
            <StatHelpText>
              {rateText(stat.day.rate)}
            </StatHelpText>
          </Stat>
          <Progress size='lg' isAnimated flexGrow={1} hasStripe value={+minuteToHour(stat.day.thisPeriodNum) / 3 * 100} />
        </HStack>

      <StatGroup gap={8} >
        <Stat>
          <StatLabel>近一周（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.week.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.week.rate)}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>近一月（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.month.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.month.rate)}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>近一年（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.year.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.year.rate)}
          </StatHelpText>
        </Stat>
      </StatGroup>

      <Slider  min={1} max={12} step={1} value={range} onChange={setRange} size='sm'>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb boxSize={6} />
      </Slider>
      <Heatmap theme={colorMode} range={range} highlight={[stat.today]} start={stat.today.subtract(range - 1, 'month')} datas={stat.dayDatas}></Heatmap>
      <Box  height={"500px"}  id={fourteenDaysEChartId}></Box>
      <Text>
        todo 近14天折线图，其中标注3小时作为一条线
      </Text>

      <Text>
        TODO 各种max，绘画时间最多的自然天，周，月
      </Text>

      </VStack>
      </Container>
  )
}

export default App

function fourteenDaysLineChart(today: Dayjs, dayDatas: [Dayjs, number][]): EChartsOption {
  const fourteenDaysAgo = today.subtract(27, 'day')
  const [dates, values] = _(dayDatas)
      .filter(([date]) => (date.isAfter(fourteenDaysAgo) || date.isSame(fourteenDaysAgo)) &&
                          (date.isBefore(today) || date.isSame(today)))
      .map(([date, value]) => [date.format('MM-DD'), value] as [string, number])
      .reverse()
      .unzip().value() as [string[], number[]]
  const average = values.length === 0 ? 0 : _(values).sum() / values.length
  console.log('?', dayDatas)
  return {
    title: {
      text: '近 28 天每日绘画时间（分）'
    },
    tooltip: {
      trigger: 'item',
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      // max: 300,
      interval: 30,
      max: (v) => v.max > 180 ? (Math.floor(v.max / 30) + 1) * 30 : 210
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        markLine: {
          data: [{
            name: '期望',
            yAxis: 180,
          }, {
            type: 'average',
            name: '平均值',
            lineStyle: {
              color: average >= 180 ? '' : 'red'
            }
          }],
          
        }
      }
    ]
  }
}