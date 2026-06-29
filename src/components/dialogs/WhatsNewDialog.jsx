import React, { Fragment } from 'react'
import styled from 'styled-components'
import { APP_VERSION } from '../../core/utils'
import TSDialog from './TSDialog'
import SupportLinks from './SupportLinks'

const CHANGELOG_ITEMS = [
  'modularize support links into shared component',
  'update dialogs to use centered logo',
  'auto-update WhatsNew page from CHANGELOG during release',
]

export default function WhatsNewDialog() {
  return (
    <TSDialog
      title={`What's New in Ya Snooze, Ya Win ${APP_VERSION}`}
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
      <SupportLinks />
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
