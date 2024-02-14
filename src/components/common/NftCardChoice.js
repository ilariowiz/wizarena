import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import '../../css/NftCardChoice.css'
import ModalStats from './ModalStats'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import { CTA_COLOR } from '../../actions/types'


class NftCardChoice extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showModalStats: false
        }
    }

    renderActionsSection(section, item, canSubscribe, inToSubscribe) {

        if (section === 'tournament') {
            return (
                <div style={{ width: '100%' }}>
                    {
                        canSubscribe && item.level && !inToSubscribe ?
                        <button
                            className='btnSubscribe'
                            style={styles.btnSubscribe}
                            onClick={() => {
                                this.onSubscribe({ name: item.spellSelected.name })
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Select to subscribe
                            </p>
                        </button>
                        :
                        null
                    }

                    {
                        !canSubscribe ?
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
                        inToSubscribe && canSubscribe ?
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
            )
        }
        else if (section === 'challenge') {
            return (
                <div style={{ width: '100%' }}>
                    <button
                        className='btnSubscribe'
                        style={styles.btnSubscribe}
                        onClick={() => {
                            this.onSubscribe(item.spellSelected)
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Select
                        </p>
                    </button>
                </div>
            )
        }
        else if (section === "flash" || section === "lords") {
            return (
                <div style={{ width: '100%' }}>
                    <button
                        className='btnSubscribe'
                        style={styles.btnSubscribe}
                        onClick={() => {
                            this.props.onSubscribe(item.id)
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Select
                        </p>
                    </button>
                </div>
            )
        }
    }

    onSubscribe(spellSelected) {
        //console.log(spellSelected);
        this.props.onSubscribe(spellSelected)
    }

	render() {
		const { item, width, canSubscribe, toSubscribe, mainTextColor, isDarkmode, section } = this.props

        //console.log(item)

        const inToSubscribe = toSubscribe ? toSubscribe.some(i => i.idnft === item.id) : false

        return (
			<div
				className='containerChoice'
			>
                <a
                    href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: 'pointer' }}
                >
    				<img
    					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
    					src={getImageUrl(item.id)}
    					alt={`#${item.id}`}
    				/>
                </a>

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

                    {this.renderActionsSection(section, item, canSubscribe, inToSubscribe)}

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

export default connect(mapStateToProps)(NftCardChoice);
