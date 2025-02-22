import * as core from '@actions/core'
import { RequestError } from '@octokit/request-error'
import { GitHubContext } from './github'

export const addLabels = async (github: GitHubContext, labels: string[]): Promise<void> => {
  if (labels.length < 1) {
    return
  }
  if (!github.issueNumber) {
    core.info(`Ignored non pull request event: ${github.eventName}`)
    return
  }

  core.info(`Adding the labels to #${github.issueNumber}: ${labels.join(', ')}`)
  const { data: added } = await github.octokit.rest.issues.addLabels({
    owner: github.owner,
    repo: github.repo,
    issue_number: github.issueNumber,
    labels,
  })
  core.info(`Added the labels: ${added.map((l) => l.name).join(', ')}`)
}

export const removeLabels = async (github: GitHubContext, labels: string[]): Promise<void> => {
  if (labels.length < 1) {
    return
  }
  if (!github.issueNumber) {
    core.info(`Ignored non pull request event: ${github.eventName}`)
    return
  }

  for (const label of labels) {
    core.info(`Removing the label from #${github.issueNumber}: ${label}`)
    try {
      await github.octokit.rest.issues.removeLabel({
        owner: github.owner,
        repo: github.repo,
        issue_number: github.issueNumber,
        name: label,
      })
      core.info(`Removed the label: ${label}`)
    } catch (error) {
      if (error instanceof RequestError && error.status === 404) {
        core.info(`Skip removing the label: ${String(error)}`)
        continue
      }
      throw error
    }
  }
}
