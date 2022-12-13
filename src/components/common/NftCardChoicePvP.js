import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import cardStats from './CardStats'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import ModalSpellbook from './ModalSpellbook'
import {
    getPvPsubscription
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoicePvP extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isSubscribed: false,
            subscriptionInfo: {},
            showModalSpellbook: false
        }
    }

    componentDidMount() {
        const { item, pvpWeek, chainId, gasPrice, gasLimit, networkUrl } = this.props

        //console.log(item, tournament);

        const idSubscription = `${pvpWeek}_${item.id}`
        this.props.getPvPsubscription(chainId, gasPrice, gasLimit, networkUrl, idSubscription, (response) => {
            //console.log(response)
            if (response && response.idnft) {
                this.props.isSubscribed(response)
                this.setState({ subscriptionInfo: response, isSubscribed: true })
            }
        })
    }

    calcMedals() {
        const { item } = this.props

        const medals = item.medals

        let tot = 0

        Object.keys(medals).forEach(i => {
            tot += parseInt(medals[i])
        })

        return tot
    }

    onSubscribe(spellSelected) {
        this.props.onSubscribe(spellSelected)
    }

	render() {
		const { item, width, canSubscribe } = this.props
        const { isSubscribed } = this.state

        //console.log(tournament)

        const numberOfTotalMedals = item.medals ? this.calcMedals() : 0

        const level = calcLevelWizard(item)

		return (
			<div
				className='containerChoice'
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

				<div style={{ flexDirection: 'column', width, alignItems: 'center' }}>

					<div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
						<p style={{ color: 'white', fontSize: 17 }}>
							{item.name}
						</p>
					</div>

					<div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        {
                            level ?
                            <div style={{ width: '90%', alignItems: 'center', marginBottom: 8 }}>
                                <p style={{ color: '#c2c0c0', fontSize: 16, marginRight: 10 }}>
                                    LEVEL
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(level), fontSize: 18 }}>
                                    {level}
                                </p>
                            </div>
                            : null
                        }

                        {
                            item.hp ?
                            cardStats(item, numberOfTotalMedals)
                            :
                            null
                        }


                        {
                            !isSubscribed && canSubscribe && level ?
                            <button
                                className='btnSubscribe'
                                style={styles.btnSubscribe}
                                onClick={() => this.setState({ showModalSpellbook: true })}
                            >
                                <p style={{ fontSize: 17, color: 'white' }}>
                                    SUBSCRIBE
                                </p>
                            </button>
                            :
                            null

                        }

                        {
                            !isSubscribed && !canSubscribe ?
                            <div
                                style={Object.assign({}, styles.btnSubscribe, { backgroundColor: '#014766'})}
                            >
                                <p style={{ fontSize: 15, color: 'white' }}>
                                    Registrations closed
                                </p>
                            </div>
                            :
                            null

                        }

                        {
                            isSubscribed ?
                            <div
                                style={Object.assign({}, styles.btnSubscribe, { backgroundColor: '#014766'})}
                            >
                                <p style={{ fontSize: 17, color: 'white' }}>
                                    Already subscribed
                                </p>
                            </div>
                            : null
                        }


                    </div>

				</div>

                {
                    this.state.showModalSpellbook &&
                    <ModalSpellbook
                        showModal={this.state.showModalSpellbook}
                        onCloseModal={() => this.setState({ showModalSpellbook: false })}
                        width={this.props.modalWidth}
                        stats={item}
                        onSub={(spellSelected) => {
                            this.onSubscribe(spellSelected)
                            this.setState({ showModalSpellbook: false })
                        }}
                    />
                }

			</div>
		)
	}
}

const styles = {
    statsTitleStyle: {
        fontSize: 15,
        color: '#c2c0c0',
        marginRight: 8
    },
    statsStyle: {
        fontSize: 15,
        color: 'white'
    },
    btnSubscribe: {
        height: 45,
        width: '100%',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    getPvPsubscription
})(NftCardChoicePvP);