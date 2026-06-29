import React from 'react'
import styled from 'styled-components'
import {
  CHROME_WEB_STORE_REVIEW,
  GITHUB_REPO_URL,
  DONATE_URL_DEVELOPER2,
  DONATE_URL_DEVELOPER3,
  DONATE_URL_ORIGINAL_DEVELOPER,
} from '../../paths'

export default function SupportLinks() {
  return (
    <LinkList>
      <LinkItem href={CHROME_WEB_STORE_REVIEW} target="_blank" rel="noopener noreferrer">
        ⭐ Rate Ya Snooze, Ya Win
      </LinkItem>
      <LinkItem href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
        💻 Open Source Codebase
      </LinkItem>
      <li>
        ❤️ Support the Developers
        <SubList>
          <SubLinkItem href={DONATE_URL_DEVELOPER3} target="_blank" rel="noopener noreferrer">
            Latest Developer
          </SubLinkItem>
          <SubLinkItem href={DONATE_URL_DEVELOPER2} target="_blank" rel="noopener noreferrer">
            Second Developer
          </SubLinkItem>
          <SubLinkItem href={DONATE_URL_ORIGINAL_DEVELOPER} target="_blank" rel="noopener noreferrer">
            Original Developer
          </SubLinkItem>
        </SubList>
      </li>
    </LinkList>
  )
}

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 20px;
  font-weight: 500;
  color: #333;
`

const LinkItem = styled.a`
  font-size: 20px;
  font-weight: 500;
  color: #4a90e2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const SubList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 8px 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SubLinkItem = styled.a`
  font-size: 17px;
  font-weight: 400;
  color: #4a90e2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
