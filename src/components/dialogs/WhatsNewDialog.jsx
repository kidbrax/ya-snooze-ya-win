import React, { Fragment } from 'react'
import styled from 'styled-components'
import {
  DONATE_URL_DEVELOPER2,
  DONATE_URL_DEVELOPER3,
  DONATE_URL_ORIGINAL_DEVELOPER,
  GITHUB_REPO_URL,
} from '../../paths'
import { APP_VERSION } from '../../core/utils'
import TSDialog from './TSDialog'
import Button from '../SnoozePanel/Button'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CodeIcon from '@mui/icons-material/Code'

import congratsImage from './images/congrats.png'

const CHANGELOG_ITEMS = ['Fixed a bug where snoozed tabs could re-open repeatedly']

export default function WhatsNewDialog() {
  return (
    <TSDialog
      title={`What's New in Ya Snooze, Ya Win ${APP_VERSION}`}
      image={congratsImage}
      headline={`Ya Snooze, Ya Win ${APP_VERSION}`}
      subheader={
        <Fragment>
          Thanks for sticking with Ya Snooze, Ya Win. I appreciate your patience for this update. Here&apos;s
          what&apos;s new:
          <ChangelogList>
            {CHANGELOG_ITEMS.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ChangelogList>
        </Fragment>
      }
      closeBtnText="Close"
    >
      <DonateButtons>
        <DonateButton raised as="a" color="#FF5E5B" href={DONATE_URL_DEVELOPER2} target="_blank">
          <FavoriteIcon />
          Support Current Developer
        </DonateButton>
        <DonateButton raised as="a" color="#4A90E2" href={DONATE_URL_ORIGINAL_DEVELOPER} target="_blank">
          <FavoriteIcon />
          Support Original Developer
        </DonateButton>

        <DonateButton raised as="a" color="#777777" href={GITHUB_REPO_URL} target="_blank">
          <CodeIcon />
          Open source codebase
        </DonateButton>
      </DonateButtons>
    </TSDialog>
  )
}

const ChangelogList = styled.ul`
  text-align: left;
  margin: 16px auto 0;
  padding-left: 20px;
  list-style-type: disc;

  li {
    margin-bottom: 6px;
  }
`

const DonateButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`

const DonateButton = styled(Button)`
  display: flex;
  align-items: center;
  padding: 14px 24px;
  font-size: 18px;
  text-decoration: none;
`
