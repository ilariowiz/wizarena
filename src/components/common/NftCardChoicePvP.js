import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import ModalStats from './ModalStats'
import '../../css/NftCardChoice.css'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import {
    getPvPsubscription
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoicePvP extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            isSubscribed: false,
            subscriptionInfo: {},
            spellSelected: undefined,
            showModalStats: false
        }
    }

    componentDidMount() {
        const { item, pvpWeek, chainId, gasPrice, gasLimit, networkUrl, index } = this.props

        //console.log(item);

        setTimeout(() => {
            const idSubscription = `${pvpWeek}_${item.id}`
            this.props.getPvPsubscription(chainId, gasPrice, gasLimit, networkUrl, idSubscription, (response) => {
                //console.log(response)
                if (response && response.idnft) {
                    this.setState({ subscriptionInfo: response, isSubscribed: true, loading: false })
                } else {
                    this.setState({ loading: false })
                }
            })
        }, index*30)
    }

    onSubscribe(spellSelected, wizaAmount) {
        this.props.onSubscribe(spellSelected, wizaAmount)
    }

	render() {
		const { item, width, canSubscribe, toSubscribe, mainTextColor, isDarkmode } = this.props
        const { isSubscribed, loading } = this.state

        //console.log(tournament)

        const inToSubscribe = toSubscribe.some(i => i.idnft === item.id)

		return (
			<div
				className='containerChoice'
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

                <div style={{ flexDirection: 'column', width, alignItems: 'center' }}>

					<div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>

                        <p style={{ color: mainTextColor, fontSize: 16 }} className="text-bold">
							{item.name}
						</p>

                        {
                            item.level ?
                            <div style={{ alignItems: 'center' }}>
                                <p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
                                    Level
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(item.level, isDarkmode), fontSize: 17 }} className="text-bold">
                                    {item.level}
                                </p>
                            </div>
                            : null
                        }
					</div>

                    <button
                        style={{ marginBottom: 10, width: 100, height: 23, alignItems: 'center', borderRadius: 4, borderColor: CTA_COLOR, borderWidth: 1, borderStyle: 'solid' }}
                        onClick={() => this.setState({ showModalStats: true })}
                    >
                        <p style={{ fontSize: 14, color: mainTextColor }} className="text-regular">
                            see stats
                        </p>
                    </button>

                    {
                        loading ?
                        <div
                            style={styles.btnSubscribe}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Loading
                            </p>
                        </div>
                        : null
                    }


                    {
                        !isSubscribed && canSubscribe && item.level && !loading && !inToSubscribe ?
                        <button
                            className='btnSubscribe'
                            style={styles.btnSubscribe}
                            onClick={() => this.onSubscribe(item.spellSelected, 30)}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Select to subscribe
                            </p>
                        </button>
                        :
                        null

                    }

                    {
                        !isSubscribed && !canSubscribe && !loading ?
                        <div
                            style={styles.btnSubscribe}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Registrations closed
                            </p>
                        </div>
                        :
                        null

                    }

                    {
                        isSubscribed && !loading ?
                        <div
                            style={styles.btnSubscribe}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Already subscribed
                            </p>
                        </div>
                        : null
                    }

                    {
                        inToSubscribe && !isSubscribed && canSubscribe && !loading ?
                        <button
                            className='btnSubscribe'
                            style={styles.btnSubscribe}
                            onClick={() => this.props.removeFromSubscribers(item.id)}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Remove from subscribers
                            </p>
                        </button>
                        : null
                    }

				</div>

                {
                    this.state.showModalStats ?
                    <ModalStats
                        item={item}
                        showModal={this.state.showModalStats}
                        onCloseModal={() => this.setState({ showModalStats: false })}
                    />
                    : undefined
                }

			</div>
		)
	}
}

const styles = {
    btnSubscribe: {
        height: 40,
        width: '100%',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode }
}

export default connect(mapStateToProps, {
    getPvPsubscription
})(NftCardChoicePvP);
