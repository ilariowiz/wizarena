import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import moment from 'moment'
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
            error: ""
        }

        this.allSales = []
    }

    componentDidMount() {
        const { lastTimeUpdateSales } = this.props

		document.title = "Sales - Wizards Arena"

        let diff = undefined
        if (lastTimeUpdateSales) {
            diff = moment().diff(lastTimeUpdateSales, 'minutes')
        }

        //console.log(lastTimeUpdateSales, diff);

        //this.loadSales()
        if (!lastTimeUpdateSales || (diff && diff > 10)) {
            this.loadSales()
        }
        else {
            this.setState({ loading: false })
        }

	}

    loadSales(next) {

		let url = 'https://estats.chainweb.com/txs/events?search=wiz-arena.WIZ_BUY&limit=50'

		//console.log(url);
		fetch(url)
  		.then(response => response.json())
  		.then(data => {
  			//console.log(data)
            this.setState({ loading: false })
            this.props.setSales(data)
  		})
		.catch(e => {
			console.log(e)
			this.setState({ loading: false, error: "Ops... something goes wrong!" })
		})

	}

    renderSale(item, index, isMobile) {
        const { sales } = this.props

        return (
			<HistoryItem
				item={item}
				index={index}
				nftH={sales}
				key={index}
				isMobile={isMobile}
                isAll={true}
                history={this.props.history}
			/>
		)
    }

    renderBody(isMobile) {
        const { loading, error } = this.state
        const { sales } = this.props

        const boxW = Math.floor(window.innerWidth * (isMobile ? 85 : 92) / 100)

        return (
            <div style={{ width: boxW, alignItems: 'center', flexDirection: 'column', paddingTop: 30 }}>
                <p style={{ fontSize: 28, color: 'white', marginBottom: 30 }}>
                    Last sales
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                <div style={{ width: '100%', flexDirection: 'column' }}>
                    {sales.map((item, index) => {
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
			<div style={{ width: '100%' }}>
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
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
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
		alignItems: 'center',
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
