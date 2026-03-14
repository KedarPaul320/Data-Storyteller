import os
import uuid
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser , FormParser
from .pandas_utils import extract_dataframe_metadata , apply_dynamic_filters, load_dataframe_cached
from .chart_generator import generate_chart


MAX_ANALYZE_RESPONSE_ROWS = 5000

# Create your views here.
class FileUploadView(APIView):
    parser_classes = (MultiPartParser , FormParser)

    def post(self , request , *args , **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error" : "No file uploaded"} , status=status.HTTP_400_BAD_REQUEST)
        
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file_obj.name)[1]

        if ext not in ['.csv' , '.xlsx']:
            return Response({"error" : "Only .csv and .xlsx files are allowed"} , status=status.HTTP_400_BAD_REQUEST)
        
        fs = FileSystemStorage(location=settings.MEDIA_ROOT)
        saved_filename = f"{file_id}{ext}"
        fs.save(saved_filename , file_obj)

        full_path = os.path.join(settings.MEDIA_ROOT , saved_filename)

        try:
            metadata = extract_dataframe_metadata(full_path , saved_filename)
        except Exception as e:
            if os.path.exists(full_path):
                os.remove(full_path)
            return Response({"error" : str(e)} , status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "file_id" : file_id,
            "filename" : saved_filename,
            "metadata" : metadata,
        } , status=status.HTTP_201_CREATED)
    

class AnalyzeDataView(APIView):
    def post(self , request , *args , **kwargs):
        file_id = request.data.get('file_id')
        filename = request.data.get('filename')
        filters = request.data.get('filters' , {})

        if not file_id or not filename:
            return Response({"error" : "file_id and filename are required"} , status=status.HTTP_400_BAD_REQUEST)
        
        full_path = os.path.join(settings.MEDIA_ROOT , filename)
        if not os.path.exists(full_path):
            return Response({"error" : "File not found"} , status=status.HTTP_404_NOT_FOUND)
        
        try:
            if not filename.endswith(('.csv', '.xlsx')):
                return Response({"error" : "Unsupported file format"} , status=status.HTTP_400_BAD_REQUEST)
            df = load_dataframe_cached(full_path)
            
            filtered_df = apply_dynamic_filters(df , filters)
            filtered_df = filtered_df.fillna('')
            total_filtered_rows = len(filtered_df)
            data_frame_for_response = filtered_df.head(MAX_ANALYZE_RESPONSE_ROWS)
            data_records = data_frame_for_response.to_dict(orient='records')

            return Response({
                "total_rows" : len(df),
                "filtered_rows" : total_filtered_rows,
                "returned_rows" : len(data_records),
                "truncated" : total_filtered_rows > MAX_ANALYZE_RESPONSE_ROWS,
                "data" : data_records,
            } , status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : str(e)} , status=status.HTTP_400_BAD_REQUEST)


class GenerateChartView(APIView):
    def post(self, request, *args, **kwargs):
        file_id = request.data.get('file_id')
        filename = request.data.get('filename')
        filters = request.data.get('filters', {})
        chart_type = request.data.get('chart_type')
        x_axis = request.data.get('x_axis')
        y_axis = request.data.get('y_axis')

        if not all([file_id, filename, chart_type, x_axis, y_axis]):
            return Response(
                {"error": "file_id, filename, chart_type, x_axis, and y_axis are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        full_path = os.path.join(settings.MEDIA_ROOT, filename)
        if not os.path.exists(full_path):
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            if not filename.endswith(('.csv', '.xlsx')):
                return Response({"error": "Unsupported file format"}, status=status.HTTP_400_BAD_REQUEST)

            df = load_dataframe_cached(full_path)
            filtered_df = apply_dynamic_filters(df, filters)

            # Generate chart using Plotly
            chart_data = generate_chart(filtered_df, chart_type, x_axis, y_axis)

            return Response({
                "success": True,
                "chart_data": chart_data,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)