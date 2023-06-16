import React, {useState} from 'react'
import {PDFDownloadLink} from '@react-pdf/renderer';
import SchedulePrintView from "../schedule-print/schedule-print-view";
import styles from './styles.module.scss'


const SchedulePrintButton = ({events, summit, nowUtc = null}) => {
    const [downloadPdf, setDownloadPdf] = useState(false);
    
    return (
        <>
            {!downloadPdf &&
                <button className={`${styles.button} ${styles.cal}`} onClick={() => setDownloadPdf(true)}>
                    <i className='fa fa-print' aria-hidden='true'/>
                    Print
                </button>
            }
            
            {downloadPdf &&
                <PDFDownloadLink
                    className={`${styles.button} ${styles.cal}`}
                    document={<SchedulePrintView events={events} summit={summit} nowUtc={nowUtc}/>}
                    fileName="schedule.pdf"
                >
                    {({blob, url, loading, error}) => {
                        return (!blob || loading ? 'Creating document...' : 'Download PDF');
                    }
                    }
                </PDFDownloadLink>
            }
        </>
    );
}

export default SchedulePrintButton;
