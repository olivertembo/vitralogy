import React, { useState, useEffect } from 'react'

import * as api from "../../constants/api"
import ResultWizard from "./resources/resultsBehalf/ResultWizard"
import OverlayButton from "../layout/OverlayButton"
import { ReactComponent as CalendarIcon } from "../../assets/icons/brand/calendar.svg"




export default function CompleteJobButton(props) {
  const [showResultWizard, setShowResultWizard] = useState(false)
  const [customerCanClose, setCustomerCanClose] = useState(false)
  const [conclusionTypes, setConclusionTypes] = useState(null)
  const [conclusions, setConclusions] = useState(null)

  useEffect(() => {
    const url = api.IS_FINALIAZBLE(props.jobId)

    props.auth
      .request("get", url)
      .query({ jobSourcingTierId: props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const {
            body: { IsSuccess, FailedReasonCount, FailedReasons },
          } = response
          if (IsSuccess === true) {
            if (FailedReasonCount > 0) {
              const jobSpecificReasons = FailedReasons.filter(
                reason => reason.Name === "Job_Specific",
              )
              const reasonsWithNonCriticalDate = jobSpecificReasons.filter(
                reason =>
                  reason.ReasonByTestTypes.filter(
                    type => type.TestTypeId === 10,
                  ).length > 0,
              )

              if (reasonsWithNonCriticalDate.length > 0) {
                setCustomerCanClose(false)
              }
            } else {
              setCustomerCanClose(true)
            }
          } else {
            console.log("failed to check finalizable")
          }
        },
        () => {
          console.log("failed to check finalizable")
        },
      )
  }, [props.jobId, props.tierId, props.auth, setCustomerCanClose])

  useEffect(() => {
    const url = api.GET_CONCLUSION_TYPES(props.data.ConclusionGroupId)

    props.auth.request("get", url).then(
      response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        if (response.body.IsSuccess === true) {
          setConclusionTypes(response.body.Conclusions)
        } else {
          console.log("failed to get conclusion types")
        }
      },
      () => {
        console.log("failed to get conclusion types")
      },
    )
  }, [props.data, props.auth, setConclusionTypes])

  useEffect(() => {
    let jobResourceId = props.jobResourceId || props.resource.JobResourceId

    const url = `${api.CONCLUSION_ENDPOINT}${props.jobId}`

    props.auth
      .request("get", url)
      .query({ jobResourceId: jobResourceId })
      .query({ tierId: props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            setConclusions(response.body.Conclusions)
          } else {
            console.log("failed to get results")
          }
        },
        () => {
          console.log("failed to get results")
        },
      )
  }, [props.auth, props.jobResourceId, props.tierId, props.jobId, props.resource, setConclusions])

  const handleOnHideResultWizard = (success) => {
    setShowResultWizard(false)
  }


  return <div>
    {showResultWizard && (
      <ResultWizard
        updateSignOff={props.updateSignOff}
        confirmStepRequired={false}
        reviewStepRequired={false}
        auth={props.auth}
        jobId={props.jobId}
        tierId={props.tierId}
        conclusionItems={conclusionTypes}
        results={conclusions}
        onHide={handleOnHideResultWizard}
        resources={props.data.Resources}
        resultOnBehalf={props.data.Job_IsResultOnBehalfAllowed}
      />
    )}
    {customerCanClose && (
      <OverlayButton
        bsStyle="primary"
        bsClass="complete-button"
        text="Set the result on behalf of the vendor"
        onClick={() => {
          setShowResultWizard(true)
        }}
      >
        <CalendarIcon /> Complete Job
      </OverlayButton>
    )}
  </div>
}