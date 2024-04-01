import { Box, Button, Container, HStack, Progress, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber, Tag, TagLabel, Text, VStack, useColorMode, useTheme } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Heatmap from './Heatmap'
import { useStat } from './useStat'
import { EChartsOption } from 'echarts'
import { useEcharts } from './useEcharts'
import { Dayjs } from 'dayjs'
import _ from 'lodash'

const EXPECT = 3

function minuteToHour(minute: number): string {
  return (minute / 60).toFixed(1)
}

function App() {
  const stat = useStat()
  const { colorMode, toggleColorMode } = useColorMode()
  const fourteenDaysEChartOption = useMemo(() => fourteenDaysLineChart(stat.today, stat.dayDatas), [stat])
  const { id: fourteenDaysEChartId } = useEcharts(fourteenDaysEChartOption, colorMode)

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

  console.log('year', stat.year.thisNatural[0].format('YYYY-MM-DD'), (stat.today.diff(stat.year.thisNatural[0], 'day') + 1))

  return (
    <Container maxW='64em'>
      <Button onClick={toggleColorMode}>toggle</Button>
      <VStack alignItems={'stretch'} spacing={8}>
        <HStack mt={8}>
          <Box flexBasis={'8em'} flexGrow={0}></Box>
          <Stat flexBasis={'10em'} flexGrow={0}>
            <StatLabel>本日（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.day.thisNaturalNum)} / {EXPECT}</StatNumber>
            <StatHelpText>
              {rateText(stat.day.realRate)}
            </StatHelpText>
          </Stat>
          <MyProgress value={+minuteToHour(stat.day.thisNaturalNum) / EXPECT * 100}></MyProgress>
        </HStack>

        <HStack>
          <Stat flexBasis={'8em'} flexGrow={0}>
            <StatLabel>近一周（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.week.thisRealNum)}</StatNumber>
            <StatHelpText>
              {rateText(stat.week.realRate)}
            </StatHelpText>
          </Stat>
          <Stat flexBasis={'10em'} flexGrow={0}>
            <StatLabel>本周（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.week.thisNaturalNum)} / {EXPECT * 7}</StatNumber>
            <StatHelpText>
              {rateText(stat.week.naturalRate)}
            </StatHelpText>
          </Stat>
          <MyProgress expect={(stat.today.diff(stat.week.thisNatural[0], 'day') + 1) / 7 * 100} value={+minuteToHour(stat.week.thisNaturalNum) / (EXPECT * 7) * 100}></MyProgress>
        </HStack>
        <HStack>
          <Stat flexBasis={'8em'} flexGrow={0}>
            <StatLabel>近一月（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.month.thisRealNum)}</StatNumber>
            <StatHelpText>
              {rateText(stat.month.realRate)}
            </StatHelpText>
          </Stat>
          <Stat flexBasis={'10em'} flexGrow={0}>
            <StatLabel>本月（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.month.thisNaturalNum)} / {EXPECT * 30}</StatNumber>
            <StatHelpText>
              {rateText(stat.month.naturalRate)}
            </StatHelpText>
          </Stat>
          <MyProgress expect={(stat.today.diff(stat.month.thisNatural[0], 'day') + 1) / 30 * 100} value={+minuteToHour(stat.month.thisNaturalNum) / (EXPECT * 30) * 100}></MyProgress>
        </HStack>
        <HStack>
          <Stat flexBasis={'8em'} flexGrow={0}>
            <StatLabel>近一年（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.year.thisRealNum)}</StatNumber>
            <StatHelpText>
              {rateText(stat.year.realRate)}
            </StatHelpText>
          </Stat>

          <Stat flexBasis={'10em'} flexGrow={0}>
            <StatLabel>本年（小时）</StatLabel>
            <StatNumber>{minuteToHour(stat.year.thisNaturalNum)} / {EXPECT * 365} </StatNumber>
            <StatHelpText>
              {rateText(stat.year.naturalRate)}
            </StatHelpText>
          </Stat>
          <MyProgress expect={(stat.today.diff(stat.year.thisNatural[0], 'day') + 1) / 365 * 100} value={+minuteToHour(stat.year.thisNaturalNum) / (EXPECT * 365) * 100}></MyProgress>
        </HStack>

        <Slider min={1} max={12} step={1} value={range} onChange={setRange} size='sm'>
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
        <Heatmap theme={colorMode} range={range} highlight={[stat.today]} start={stat.today.subtract(range - 1, 'month')} datas={stat.dayDatas}></Heatmap>
        <Box height={"500px"} id={fourteenDaysEChartId}></Box>

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
        // sampling: 'average',
        symbolSize: 8,
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

function MyProgress({ value, expect }: { value: number, expect?: number }) {
  return (<>
    <Box flexGrow={1} position={'relative'}>
      {expect ? <Tag _after={{
        content: `''`,
        position: 'absolute',
        transform: 'translateX(-50%)',
        top: '100%',
        bottom: '-10px',
        left: '50%',
        borderWidth: '5px',
        borderStyle: 'solid',
        borderColor: 'var(--tag-bg) transparent transparent transparent'
      }}
        variant='solid'
        position={'absolute'}
        top={"-120%"}
        right={0}
        bottom={"120%"}
        left={`${expect}%`}
        width={'fit-content'}
        transform={"translate(-50%, -50%)"}><TagLabel>Expect</TagLabel></Tag> : <></>}
     
      <Progress size='lg' isAnimated flexGrow={1} hasStripe value={value} />
    </Box>
  </>)
}