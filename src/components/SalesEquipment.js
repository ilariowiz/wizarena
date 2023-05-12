import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import moment from 'moment'
import HistoryItemEquipment from './common/HistoryItemEquipment'
import getBoxWidth from './common/GetBoxW'
import {
    setSalesEquipment
} from '../actions'


class Sales extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: ""
        }
    }

    componentDidMount() {
        const { lastTimeUpdateSalesEquipment } = this.props

		document.title = "Sales - Wizards Arena"

        let diff = undefined
        if (lastTimeUpdateSalesEquipment) {
            diff = moment().diff(lastTimeUpdateSalesEquipment, 'minutes')
        }

        //console.log(lastTimeUpdateSales, diff);

        if (!lastTimeUpdateSalesEquipment || (diff && diff > 10)) {
            this.loadSales()
        }
        else {
            this.setState({ loading: false })
        }

	}

    loadSales() {
		let url = 'https://estats.chainweb.com/txs/events?search=wiz-equipment.EQUIPMENT_BUY&limit=50'

		//console.log(url);
		fetch(url)
  		.then(response => response.json())
  		.then(data => {
  			//console.log(data)
            this.setState({ loading: false })
            this.props.setSalesEquipment(data)
  		})
		.catch(e => {
			console.log(e)
			this.setState({ loading: false, error: "Ops... something goes wrong!" })
		})
	}

    renderSale(item, index, isMobile) {
        const { salesEquipment } = this.props

        return (
			<HistoryItemEquipment
				item={item}
				index={index}
				nftH={salesEquipment}
				key={index}
				isMobile={isMobile}
                isAll={true}
                history={this.props.history}
			/>
		)
    }

    renderBody(isMobile) {
        const { loading, error } = this.state
        const { salesEquipment, mainTextColor } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', textAlign: 'center', width: boxW, padding, overflowY: 'auto', overflowX: 'hidden' }}>
                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }} className="text-medium">
                    Sales
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                <div style={{ width: '100%', flexDirection: 'column' }}>
                    {salesEquipment && salesEquipment.map((item, index) => {
                        return this.renderSale(item, index, isMobile)
                    })}
                </div>

                {
                    error &&
                    <p style={{ fontSize: 15, color: 'red' }}>
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
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
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
		flexDirection: 'column',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
}

const mapStateToProps = (state) => {
    const { mainTextColor, mainBackgroundColor } = state.mainReducer
    const { salesEquipment, lastTimeUpdateSalesEquipment } = state.salesReducer

    return { salesEquipment, lastTimeUpdateSalesEquipment, mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps, {
    setSalesEquipment
})(Sales)
