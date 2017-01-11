/* eslint-disable */
import moment from "moment"

const flatten = (groups, style) => {
  let fileIndex = 0

  const list = []
  const groupContent = groups.map(group => {
    const modelName = group.modelName
    list.push({
      isModel: true,
      isStep: false,
      isJob: false,
      isDetail: false,
      details: null,
      text: modelName,
      backgroundColor: style.modelGroupBackground,
      color: style.modelGroupText,
    })

    const stepContent = group.stepGroups.map(step => {
      const stepName = step.stepName
      list.push({
        isModel: false,
        isStep: true,
        isJob: false,
        isDetail: false,
        details: null,
        text: stepName,
        backgroundColor: style.stepGroupBackground,
        color: style.stepGroupText,
      })

      const jobItems = step.contentItems

      const jobContent = jobItems.map((p, index) => {
        list.push({
          isModel: false,
          isStep: false,
          isJob: true,
          isDetail: false,
          details: null,
          text: `Job #${p.jobNumber} on ${moment(p.jobScheduledDate).format(
            "MM/DD/YYYY",
          )}`,

          backgroundColor: style.jobBackground,
          color: style.jobText,
        })

        const commonProps = {
          isModel: false,
          isStep: false,
          isJob: false,
          isDetail: true,
          details: null,
          backgroundColor: style.documentBackground,
          color: style.documentText,
        }

        // job detail
        if (p.jobDetailsReport) {
          list.push({
            ...commonProps,
            text: "Job Detail Report",
            data: p.jobDetailsReport,
            fileIndex,
          })

          fileIndex += 1
        }

        // docs
        if (p.jobDocuments) {
          p.jobDocuments.map(doc => {
            list.push({
              ...commonProps,
              text: doc.name,
              data: doc,
              fileIndex,
            })

            fileIndex += 1
          })
        }

        // photos
        if (p.jobPhotos) {
          p.jobPhotos.map(photo => {
            list.push({
              ...commonProps,
              text: photo.name,
              data: photo,
              fileIndex,
            })
            fileIndex += 1
          })
        }

        // form details reports
        if (p.formDetailsReports) {
          p.formDetailsReports.map(form => {
            list.push({
              ...commonProps,
              text: form.name,
              data: form,
              fileIndex,
            })

            fileIndex += 1
          })
        }

        // job ytd report
        if (p.jobYTDReport) {
          list.push({
            ...commonProps,
            text: p.jobYTDReport.name,
            data: p.jobYTDReport,
            fileIndex,
          })

          fileIndex += 1
        }

        // form ytd reports
        if (p.formYTDReports) {
          p.formYTDReports.map(form => {
            list.push({
              ...commonProps,
              text: form.name,
              data: form,
              fileIndex,
            })

            fileIndex += 1
          })
        }
      })
    })
  })

  return list
}

const flattenByDocs = (groups, style) => {
  let fileIndex = 0
  const list = []
  const groupContent = groups.map(group => {
    const modelName = group.modelName
    // list.push({
    //   isModel: true,
    //   isStep: false,
    //   isJob: false,
    //   isDetail: false,
    //   details: null,
    //   text: modelName,
    //   backgroundColor: style.modelGroupBackground,
    //   color: style.modelGroupText
    // });

    const stepContent = group.stepGroups.map(step => {
      const stepName = step.stepName
      // list.push({
      //   isModel: false,
      //   isStep: true,
      //   isJob: false,
      //   isDetail: false,
      //   details: null,
      //   text: stepName,
      //   backgroundColor: style.stepGroupBackground,
      //   color: style.stepGroupText
      // });

      const jobItems = step.contentItems

      const jobContent = jobItems.map((p, index) => {
        // list.push({
        //   isModel: false,
        //   isStep: false,
        //   isJob: true,
        //   isDetail: false,
        //   details: null,
        //   text: `Job #${p.jobNumber} on ${moment(p.jobScheduledDate).format(
        //     "MM/DD/YYYY"
        //   )}`,

        //   backgroundColor: style.jobBackground,
        //   color: style.jobText
        // });

        const commonProps = {
          isModel: false,
          isStep: false,
          isJob: false,
          isDetail: true,
          details: null,
          backgroundColor: style.documentBackground,
          color: style.documentText,
        }

        // job detail
        if (p.jobDetailsReport) {
          list.push({
            ...commonProps,
            text: "Job Detail Report",
            data: p.jobDetailsReport,
            fileIndex,
          })

          fileIndex += 1
        }

        // docs
        if (p.jobDocuments) {
          p.jobDocuments.map(doc => {
            list.push({
              ...commonProps,
              text: doc.name,
              data: doc,
              fileIndex,
            })

            fileIndex += 1
          })
        }

        // photos
        if (p.jobPhotos) {
          p.jobPhotos.map(photo => {
            list.push({
              ...commonProps,
              text: photo.name,
              data: photo,
              fileIndex,
            })
            fileIndex += 1
          })
        }

        // form details reports
        if (p.formDetailsReports) {
          p.formDetailsReports.map(form => {
            list.push({
              ...commonProps,
              text: form.name,
              data: form,
              fileIndex,
            })

            fileIndex += 1
          })
        }

        // job ytd report
        if (p.jobYTDReport) {
          list.push({
            ...commonProps,
            text: p.jobYTDReport.name,
            data: p.jobYTDReport,
            fileIndex,
          })

          fileIndex += 1
        }

        // form ytd reports
        if (p.formYTDReports) {
          p.formYTDReports.map(form => {
            list.push({
              ...commonProps,
              text: form.name,
              data: form,
              fileIndex,
            })

            fileIndex += 1
          })
        }
      })
    })
  })

  return list
}

export default { flatten, flattenByDocs }
