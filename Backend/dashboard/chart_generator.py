import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json


def is_numeric(series):
    """Check if a pandas series contains numeric values."""
    try:
        numeric_values = pd.to_numeric(series, errors='coerce')
        return numeric_values.notna().sum() > 0
    except:
        return False


def get_numeric_values(series):
    """Convert series to numeric values, handling non-numeric entries."""
    return pd.to_numeric(series, errors='coerce')


def sanitize_for_json(value):
    """Convert values to JSON-serializable types."""
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        # Convert numpy types to Python types
        return float(value) if isinstance(value, float) else int(value)
    if isinstance(value, (pd.Timestamp, pd.Timedelta)):
        return str(value)
    return str(value)


def generate_bar_chart(df, x_col, y_col):
    """Generate a bar chart."""
    # Remove rows where x_col is NaN/empty
    df_clean = df.dropna(subset=[x_col])
    
    if len(df_clean) == 0:
        raise ValueError(f"No valid data found in column '{x_col}'")
    
    if is_numeric(df_clean[y_col]):
        # Group by x and sum y
        grouped = df_clean.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
        grouped[y_col] = grouped[y_col].apply(sanitize_for_json)
    else:
        # Count records per group
        grouped = df_clean.groupby(x_col).size().reset_index(name=y_col)
    
    # Sanitize x-axis values
    grouped[x_col] = grouped[x_col].apply(sanitize_for_json)

    fig = go.Figure(data=[
        go.Bar(x=grouped[x_col].tolist(), y=grouped[y_col].tolist(), marker_color='#1D4ED8')
    ])
    fig.update_layout(
        title=f'{y_col} by {x_col}',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='x unified',
        template='plotly_white',
        height=400
    )
    return fig


def generate_line_chart(df, x_col, y_col):
    """Generate a line chart."""
    # Remove rows where x_col is NaN/empty
    df_clean = df.dropna(subset=[x_col])
    
    if len(df_clean) == 0:
        raise ValueError(f"No valid data found in column '{x_col}'")
    
    if is_numeric(df_clean[y_col]):
        grouped = df_clean.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
        grouped[y_col] = grouped[y_col].apply(sanitize_for_json)
    else:
        grouped = df_clean.groupby(x_col).size().reset_index(name=y_col)

    # Sanitize x-axis values
    grouped[x_col] = grouped[x_col].apply(sanitize_for_json)

    # Sort by x if numeric
    if is_numeric(grouped[x_col]):
        grouped = grouped.sort_values(x_col)

    fig = go.Figure(data=[
        go.Scatter(x=grouped[x_col].tolist(), y=grouped[y_col].tolist(), mode='lines+markers',
                   line=dict(color='#F59E0B', width=2), marker=dict(size=6))
    ])
    fig.update_layout(
        title=f'{y_col} by {x_col}',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='x unified',
        template='plotly_white',
        height=400
    )
    return fig


def generate_scatter_chart(df, x_col, y_col):
    """Generate a scatter chart."""
    # Remove rows where both columns are NaN
    df_clean = df.dropna(subset=[x_col, y_col], how='any')
    
    if len(df_clean) == 0:
        raise ValueError(f"No valid data found in columns '{x_col}' and '{y_col}'")
    
    x_numeric = get_numeric_values(df_clean[x_col])
    y_numeric = get_numeric_values(df_clean[y_col])

    # Only include rows with valid numeric values
    valid_mask = x_numeric.notna() & y_numeric.notna()
    x_data = x_numeric[valid_mask].apply(sanitize_for_json).tolist()
    y_data = y_numeric[valid_mask].apply(sanitize_for_json).tolist()
    
    if len(x_data) == 0:
        raise ValueError(f"No numeric data found in columns '{x_col}' and '{y_col}'")

    fig = go.Figure(data=[
        go.Scatter(x=x_data, y=y_data, mode='markers',
                   marker=dict(size=8, color='#F97316', opacity=0.6))
    ])
    fig.update_layout(
        title=f'{y_col} vs {x_col}',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='closest',
        template='plotly_white',
        height=400
    )
    return fig


def generate_pie_chart(df, x_col, y_col):
    """Generate a pie chart."""
    # Remove rows where x_col is NaN/empty
    df_clean = df.dropna(subset=[x_col])
    
    if len(df_clean) == 0:
        raise ValueError(f"No valid data found in column '{x_col}'")
    
    if is_numeric(df_clean[y_col]):
        grouped = df_clean.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
        grouped[y_col] = grouped[y_col].apply(sanitize_for_json)
    else:
        grouped = df_clean.groupby(x_col).size().reset_index(name=y_col)
    
    # Sanitize labels
    grouped[x_col] = grouped[x_col].apply(sanitize_for_json)

    fig = go.Figure(data=[
        go.Pie(labels=grouped[x_col].tolist(), values=grouped[y_col].tolist(),
                marker=dict(colors=['#1D4ED8', '#F59E0B', '#F97316', '#0F766E', '#7C3AED', '#DC2626']))
    ])
    fig.update_layout(
        title=f'{y_col} Distribution by {x_col}',
        height=400
    )
    return fig


def generate_area_chart(df, x_col, y_col):
    """Generate an area chart."""
    # Remove rows where x_col is NaN/empty
    df_clean = df.dropna(subset=[x_col])
    
    if len(df_clean) == 0:
        raise ValueError(f"No valid data found in column '{x_col}'")
    
    if is_numeric(df_clean[y_col]):
        grouped = df_clean.groupby(x_col)[y_col].apply(lambda x: get_numeric_values(x).sum()).reset_index()
        grouped[y_col] = grouped[y_col].apply(sanitize_for_json)
    else:
        grouped = df_clean.groupby(x_col).size().reset_index(name=y_col)

    # Sanitize x-axis values
    grouped[x_col] = grouped[x_col].apply(sanitize_for_json)

    # Sort by x if numeric
    if is_numeric(grouped[x_col]):
        grouped = grouped.sort_values(x_col)

    fig = go.Figure(data=[
        go.Scatter(x=grouped[x_col].tolist(), y=grouped[y_col].tolist(), mode='lines',
                   fill='tozeroy', line=dict(color='#0F766E', width=2),
                   marker=dict(size=6))
    ])
    fig.update_layout(
        title=f'{y_col} by {x_col} (Area)',
        xaxis_title=x_col,
        yaxis_title=y_col,
        hovermode='x unified',
        template='plotly_white',
        height=400
    )
    return fig


def generate_box_chart(df, x_col, y_col):
    """Generate a box plot."""
    # Remove rows where y_col is NaN
    df_clean = df.dropna(subset=[y_col])
    
    if len(df_clean) == 0:
        raise ValueError(f"No valid data found in column '{y_col}'")
    
    y_numeric = get_numeric_values(df_clean[y_col])
    valid_values = y_numeric.dropna()
    
    if len(valid_values) == 0:
        raise ValueError(f"Column '{y_col}' contains no numeric values. Box plots require numeric data.")

    fig = go.Figure(data=[
        go.Box(y=valid_values.apply(sanitize_for_json).tolist(), name=y_col, marker_color='#7C3AED')
    ])
    fig.update_layout(
        title=f'Distribution of {y_col}',
        yaxis_title=y_col,
        template='plotly_white',
        height=400
    )
    return fig


def generate_histogram_chart(df, x_col, y_col):
    """Generate a histogram."""
    # Remove rows where x_col is NaN
    df_clean = df.dropna(subset=[x_col])
    
    if len(df_clean) == 0:
        raise ValueError(f"No valid data found in column '{x_col}'")
    
    x_numeric = get_numeric_values(df_clean[x_col])
    valid_mask = x_numeric.notna()
    x_data = x_numeric[valid_mask].apply(sanitize_for_json).tolist()
    
    if len(x_data) == 0:
        raise ValueError(f"Column '{x_col}' contains no numeric values. Histograms require numeric data.")

    fig = go.Figure(data=[
        go.Histogram(x=x_data, nbinsx=30, marker_color='#DC2626')
    ])
    fig.update_layout(
        title=f'Distribution of {x_col}',
        xaxis_title=x_col,
        yaxis_title='Count',
        template='plotly_white',
        height=400
    )
    return fig


def generate_chart(df, chart_type, x_col, y_col):
    """
    Generate a Plotly chart and return as JSON-serializable figure data.

    Args:
        df: pandas DataFrame
        chart_type: str - one of 'bar', 'line', 'scatter', 'pie', 'area', 'box', 'histogram'
        x_col: str - column name for x-axis
        y_col: str - column name for y-axis

    Returns:
        dict - Plotly figure data suitable for JSON serialization
    
    Raises:
        ValueError: If the chart cannot be generated or data is invalid
    """
    # Validate columns exist
    if x_col not in df.columns:
        raise ValueError(f"Column '{x_col}' not found in data")
    if y_col not in df.columns:
        raise ValueError(f"Column '{y_col}' not found in data")
    
    # Check if dataframe is empty
    if len(df) == 0:
        raise ValueError("No data available for chart generation")
    
    try:
        if chart_type == 'bar':
            fig = generate_bar_chart(df, x_col, y_col)
        elif chart_type == 'line':
            fig = generate_line_chart(df, x_col, y_col)
        elif chart_type == 'scatter':
            fig = generate_scatter_chart(df, x_col, y_col)
        elif chart_type == 'pie':
            fig = generate_pie_chart(df, x_col, y_col)
        elif chart_type == 'area':
            fig = generate_area_chart(df, x_col, y_col)
        elif chart_type == 'box':
            fig = generate_box_chart(df, x_col, y_col)
        elif chart_type == 'histogram':
            fig = generate_histogram_chart(df, x_col, y_col)
        else:
            raise ValueError(f"Unsupported chart type: {chart_type}")

        # Convert to JSON-serializable dict
        chart_dict = fig.to_dict()
        return chart_dict
    
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Error generating {chart_type} chart: {str(e)}")
