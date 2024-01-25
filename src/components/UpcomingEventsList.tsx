import { useEffect, useState } from "react"
import { Box } from "@chakra-ui/react"

import type { CommunityConference } from "@/lib/types"

import Translation from "@/components/Translation"

import { trackCustomEvent } from "@/lib/utils/matomo"

import communityConferences from "../data/community-events"

import { Button } from "./Buttons"
import EventCard from "./EventCard"
import InfoBanner from "./InfoBanner"
import InlineLink from "./Link"

type OrderedUpcomingEvent = CommunityConference & {
  date: string
  formattedDetails: string
}

const UpcomingEventsList = () => {
  const eventsPerLoad = 10
  const [orderedUpcomingEvents, setOrderedUpcomingEvents] = useState<
  OrderedUpcomingEvent[]
  >([])
  const [maxRange, setMaxRange] = useState<number>(eventsPerLoad)

  // Create Date object from each YYYY-MM-DD JSON date string
  const dateParse = (dateString: string): Date => {
    const parts = dateString.split("-")
    return new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    )
  }

  useEffect(() => {
    const eventsList: CommunityConference[] = [...communityConferences]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Remove events that have ended
    const upcomingEvents = eventsList.filter(({ endDate }) => {
      return dateParse(endDate) > yesterday
    })

    // Sort events by start date
    const orderedEvents = upcomingEvents.sort(
      (a, b) =>
        dateParse(a.startDate).getTime() - dateParse(b.startDate).getTime()
    )

    // Add formatted string to display
    const formattedEvents = orderedEvents.map((event) => {
      const dateRange =
        event.startDate === event.endDate
          ? dateParse(event.startDate).toLocaleDateString()
          : `${dateParse(event.startDate).toLocaleDateString()} - ${dateParse(
              event.endDate
            ).toLocaleDateString()}`

      const details = `${event.description}`

      return {
        ...event,
        date: dateRange,
        formattedDetails: details,
      }
    })

    setOrderedUpcomingEvents(formattedEvents)
  }, [])

  const loadMoreEvents = () => {
    setMaxRange((counter) => counter + eventsPerLoad)
    trackCustomEvent({
      eventCategory: "more events button",
      eventAction: "click",
      eventName: "load more",
    })
  }

  if (orderedUpcomingEvents.length === 0) {
    return (
      <InfoBanner emoji=":information_source:">
        <Translation id="page-community-upcoming-events-no-events" />{" "}
        <InlineLink to="https://github.com/ethereum/ethereum-org-website/blob/dev/src/data/community-events.json">
          <Translation id="page-community:page-community-please-add-to-page" />
        </InlineLink>
      </InfoBanner>
    )
  }

  return (
    <>
      <Box
        width="100%"
        margin="30px auto"
        position="relative"
        padding="0 10px"
        transition="all 0.4s ease"
        _before={{
          content: '""',
          position: "absolute",
          width: "3px",
          height: "full",
          background: "primary.base",
          top: 0,
          insetInlineStart: "50%",
        }}
        _after={{
          content: '""',
          display: "table",
          width: "100%",
          clear: "both",
        }}
      >
        {orderedUpcomingEvents
          ?.slice(0, maxRange)
          .map(({ title, to, formattedDetails, date, location }, idx) => {
            return (
              <EventCard
                key={idx}
                title={title}
                to={to}
                date={date}
                description={formattedDetails}
                location={location}
                isEven={(idx + 1) % 2 === 0}
              />
            )
          })}
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        maxWidth="620px"
        marginTop="5"
      >
        {maxRange <= orderedUpcomingEvents.length && (
          <Button onClick={loadMoreEvents}>
            <Translation id="page-community:page-community-upcoming-events-load-more" />
          </Button>
        )}
      </Box>
    </>
  )
}

export default UpcomingEventsList
