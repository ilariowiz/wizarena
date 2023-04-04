import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { firebasedb } from './Firebase';
import { Chart } from "react-google-charts";
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import moment from 'moment'
import getBoxWidth from './common/GetBoxW'
import HistoryItem from './common/HistoryItem'
import { BACKGROUND_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    setSales
} from '../actions'


class Sales extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: "",
            allSales: [],
            dataSales: [],
            selectedSales: []
        }
    }

    componentDidMount() {
		document.title = "Sales - Wizards Arena"

        this.loadSales()
	}

    async loadSales(next) {

        let days = 28
        if (window.innerWidth < 700) {
            days = 21
        }

        const newDate = moment().subtract(days, 'days').format()

        //console.log(newDate);

        const q = query(collection(firebasedb, "sales"), where('blockTime', '>', newDate), orderBy("blockTime", "desc"))

		const querySnapshot = await getDocs(q)

        let data = [["Date", "Sales", { role: 'style'}]]
		let nftH = []
        let dateObj = {}

		querySnapshot.forEach(doc => {
            const d = doc.data()

            if (!d.type) {
                const date = moment(d.blockTime).format("DD-MM")

                if (dateObj[date]) {
                    dateObj[date]['amount'] += 1
                }
                else {
                    dateObj[date] = { amount: 1 }
                }

    			nftH.push(doc.data())
            }
		})

        //console.log(dateObj);

        let temp = []

        Object.keys(dateObj).map(key => {
            temp.push([key, dateObj[key]['amount'], TEXT_SECONDARY_COLOR])
        })

        temp = temp.reverse()

        //console.log(temp);

        let sales = {}

        for (var i = 0; i < nftH.length; i++) {
            let sale = nftH[i]
            const date = moment(sale.blockTime).format("DD-MM")

            if (sales[date]) {
                sales[date].push(sale)
            }
            else {
                sales[date] = [sale]
            }
        }

        //console.log(sales);

        data.push(...temp)

        //console.log(data);

		//console.log(nftH);

        this.chartEvents = [
            {
                eventName: 'select',
                callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart()
                    const selection = chart.getSelection()
                    if (selection.length === 1) {
                        const [selectedItem] = selection
                        const dataTable = chartWrapper.getDataTable()
                        const { row } = selectedItem
                        //console.log(row);
                        //console.log(data[row+1]);

                        const rowInfo = data[row+1]

                        //console.log(rowInfo[0]);

                        //console.log(this.state.allSales);

                        const sales = this.state.allSales[rowInfo[0]]

                        //console.log(sales);
                        //console.log(this.state.allSales);

                        //console.log(this.state.allSales[dataTable.Wf[row].c[0].v]);
                        //this.state.allSales[dataTable.Wf[row].c[0].v]

                        this.setState({ selectedSales: sales })
                    }
                }
            }
        ]

        this.setState({ loading: false, allSales: sales, dataSales: data })
	}

    renderSale(item, index, isMobile) {
        const { selectedSales } = this.state

        //console.log(item, selectedSales);
        return (
			<HistoryItem
				item={item}
				index={index}
				nftH={selectedSales}
				key={index}
				isMobile={isMobile}
                history={this.props.history}
			/>
		)
    }

    renderBody(isMobile) {
        const { loading, error, dataSales, selectedSales } = this.state

        const { boxW } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'auto' }}>

                <p style={{ color: 'white', fontSize: 30, marginBottom: 20 }}>
                    Sales
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {
                    dataSales.length > 0 ?
                    <Chart
                        chartType='ColumnChart'
                        width={boxW}
                        height={400}
                        data={dataSales}
                        options={{
                            backgroundColor: BACKGROUND_COLOR,
                            hAxis: {
                                textStyle:{ color: 'white', fontSize: 13, fontName: "PerfectDOS"},
                            },
                            vAxis: {
                                textStyle:{ color: 'white', fontSize: 14, fontName: "PerfectDOS"}
                            },
                            legend: { position: 'none' }
                        }}
                        chartEvents={this.chartEvents}
                        chartArea={{
                            width: boxW,
                            height: 400,
                            top: 16,
                            bottom: 16,
                            left: 16,
                            right: 16
                        }}
                    />
                    : null
                }

                <div style={{ width: '100%', flexDirection: 'column', marginBottom: 40 }}>
                   {selectedSales.map((item, index) => {
                       return this.renderSale(item, index, isMobile)
                   })}
               </div>

                {
                    error &&
                    <p style={{ fontSize: 17, color: 'white' }}>
                        {error}
                    </p>
                }
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='home'
					section={6}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 1199px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1200px)"
					render={() => this.renderTopHeader(false)}
				/>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
    container: {
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
}

const mapStateToProps = (state) => {
    const { sales, lastTimeUpdateSales } = state.salesReducer

    return { sales, lastTimeUpdateSales }
}

export default connect(mapStateToProps, {
    setSales
})(Sales)
