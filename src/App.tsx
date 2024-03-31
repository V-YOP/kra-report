import { Button, Container, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber, Text, VStack, useColorMode, useTheme } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import Heatmap from './Heatmap'
import { useStat } from './stat'


function minuteToHour(minute: number): string {
    return (minute / 60).toFixed(1)
}


function App() {
  const stat = useStat()
  const { colorMode, toggleColorMode } = useColorMode()
  useEffect(() => {
    console.log(stat)
  }, [stat])

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
      <StatGroup mt={8} gap={8} >
        <Stat>
          <StatLabel>本日（小时）</StatLabel>
          <StatNumber>{minuteToHour(stat.day.thisPeriodNum)}</StatNumber>
          <StatHelpText>
            {rateText(stat.day.rate)}
          </StatHelpText>
        </Stat>

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

      <Slider  min={1} max={13} step={1} value={range} onChange={setRange} size='sm'>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb boxSize={6} />
      </Slider>
      <Heatmap theme={colorMode} range={range} highlight={[stat.today]} start={stat.today.subtract(range - 1, 'month')} datas={stat.dayDatas}></Heatmap>
      <Text>
        todo 近14天折线图
      </Text>

      </VStack>
      </Container>
  )
}

export default App
