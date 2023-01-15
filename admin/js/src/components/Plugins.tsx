import * as React from 'react';
import { withTranslation, WithTranslation, useTranslation } from 'react-i18next';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import ReactMarkdown from 'react-markdown';

import * as API from '../api';
import { smartCompare } from './common';
import WhoAmIContext from './WhoAmIContext';

import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';

const styles = (theme: Theme) => createStyles({
	root: {
		overflow: 'auto',
	},
	alert: {
		color: theme.palette.error.dark,
	},
	head: {
		height: 40,
	},
	row: {
		height: 32,
	},
	delete: {
		padding: 2,
	},
});


interface ShowPluginInfoProps {
	plugin: API.Plugin;
	onClosed: () => void;
}

function ShowPluginInfo(props: ShowPluginInfoProps) {
	const { t } = useTranslation();
	const [ open, setOpen ] = React.useState(true);
	const [ user, setUser ] = React.useState('');
	const markdown = '# Hello, *world*!\n## Now we will talk about our plugin\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n\n- very goood\n- very nice\n';

	return (
		<Dialog open={open} onClose={() => setOpen(false)} onExited={props.onClosed}>
			<DialogTitle>{t('plugin.pluginInfo', { plugin: props.plugin.name })}</DialogTitle>
			<React.Fragment>
				<ReactMarkdown>
					{markdown}
				</ReactMarkdown>
			</React.Fragment>
			<DialogActions>
				<Button color="primary" onClick={() => setOpen(false)}>{t('button.close')}</Button>
			</DialogActions>
		</Dialog>
	);
}

// Plugins List Main Page


interface PluginsListProps {
	plugins: API.Plugin[];
	classes: any;
	onShowPluginInfo(plugin: API.Plugin): void;
	//onChangePluginConfig(): void;
}

function PluginsList(props: PluginsListProps) {
	const plugins = props.plugins;
	const classes = props.classes;
	const { t } = useTranslation();

	return (
		<div className={classes.root}>
			<Table size="small">
				<TableHead>
					<TableRow className={classes.head}>
						<TableCell>{t('plugin.name')}</TableCell>
						<TableCell>{t('plugin.version')}</TableCell>
						<TableCell>{t('plugin.edit')}</TableCell>
						<TableCell>{t('plugin.about')}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{plugins.map(plugin => {
						return (
							<TableRow key={plugin.name} className={classes.row}>
								<TableCell>{plugin.name}</TableCell>
								<TableCell>1.0.0</TableCell>
								<TableCell padding="none">
									<IconButton ><EditIcon/></IconButton>
								</TableCell>
								<TableCell padding="none">
									<IconButton onClick={() => props.onShowPluginInfo(plugin)}><HelpIcon/></IconButton>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

// Props for plugins component
interface PluginsProps {
	onError: (error: unknown) => void;
}

// Components state
interface PluginsState {
	plugins: API.Plugin[];
	dialog?: JSX.Element;
}

class Plugins extends React.Component<PluginsProps & WithStyles<typeof styles> & WithTranslation> {
	state: PluginsState = {
		plugins: [],
	};

	private handleDialogClosed = () => {
		this.setState({ dialog: undefined });
	};

	componentDidMount() {
		this.load();
	}

	private async load() {
		try {
			this.setState({ plugins: await API.getPlugins() });
		} catch (error) {
			this.props.onError(error);
		}
	}

	private showPluginInfoDialog = (plugin: API.Plugin) => {
		this.setState({
			dialog: <ShowPluginInfo plugin={plugin} onClosed={this.handleDialogClosed}/>
		});
	};

	static contextType = WhoAmIContext;

	render() {
		const { classes, t } = this.props;
		const { plugins } = this.state;

		return (
			<React.Fragment>
				<PluginsList
					plugins={plugins}
					classes={classes}
					onShowPluginInfo={this.showPluginInfoDialog}
				/>
				{this.state.dialog}
			</React.Fragment>
		);
	}

}

export default withTranslation()(withStyles(styles)(Plugins));
