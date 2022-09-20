import React, { Component } from 'react';
import { connect } from 'react-redux'
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { firebasedb } from '../Firebase';
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import cardStats from './CardStats'
import ModalSpellbook from './ModalSpellbook'
import {
    getSubscription
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoice extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isSubscribed: false,
            subscriptionInfo: {},
            showModalSpellbook: false
        }
    }

    componentDidMount() {
        const { item, tournament, account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        //console.log(item, tournament);

        const idSubscription = `${tournament}_${item.id}`
        this.props.getSubscription(chainId, gasPrice, gasLimit, networkUrl, idSubscription, (response) => {
            //console.log(response)
            if (response && response.address) {
                this.setState({ subscriptionInfo: response, isSubscribed: true })
            }
        })
    }

    calcMedals() {
        const { stats } = this.props

        const medals = stats.stats.medals

        let tot = 0

        Object.keys(medals).forEach(i => {
            tot += medals[i]
        })

        return tot
    }

    onSubscribe(spellSelected) {
        const { item } = this.props

        //console.log(spellSelected)

        const key = 'stats.spellSelected'

        const docRef = doc(firebasedb, "stats", `#${item.id}`)
		updateDoc(docRef, {
            [key]: spellSelected
        })

        this.props.onSubscribe()
    }

	render() {
		const { item, stats, width, reveal, tournament, canSubscribe } = this.props
        const { isSubscribed } = this.state

        //console.log(stats, tournament)

        const numberOfTotalMedals = this.calcMedals()

		return (
			<div
				className='containerChoice'
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id, reveal)}
					alt={`#${item.id}`}
				/>

				<div style={{ flexDirection: 'column', width, alignItems: 'center' }}>

					<div style={{ width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 10 }}>
						<p style={{ color: 'white', fontSize: 17 }}>
							{item.name}
						</p>
					</div>

					<div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        {cardStats(stats, numberOfTotalMedals)}

                        {
                            !isSubscribed && canSubscribe ?
                            <button
                                className='btnSubscribe'
                                style={styles.btnSubscribe}
                                //onClick={() => this.props.onSubscribe()}
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
                        stats={stats}
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
	const { reveal, account, chainId, netId, gasPrice, gasLimit, networkUrl } = state.mainReducer

	return { reveal, account, chainId, netId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    getSubscription
})(NftCardChoice);
